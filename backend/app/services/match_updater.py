"""
Match Updater Service

Servicio que actualiza los matches desde la API de FIFA y calcula puntos.
Incluye reintentos, logging y notificaciones.
"""

import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session
import requests
import uuid

from app import sql_models
from app.scrapers.fifa_fixture import scrape_fifa_fixture_dict, map_fifa_status
from app.services.points_calculator import calculate_points

logger = logging.getLogger(__name__)


def scrape_fifa_with_retry(max_retries: int = 3, delay: float = 5.0) -> List[Dict]:
    """
    Llama a FIFA API con reintentos y delays exponenciales.

    Args:
        max_retries: Número máximo de intentos
        delay: Delay inicial en segundos (se duplica en cada reintento)

    Returns:
        Lista de matches desde FIFA API

    Raises:
        requests.RequestException: Si todos los intentos fallan
    """
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempt {attempt}/{max_retries} to scrape FIFA API")
            matches = scrape_fifa_fixture_dict()
            logger.info(f"✅ Successfully scraped {len(matches)} matches")
            return matches
        except requests.RequestException as e:
            logger.warning(f"Attempt {attempt} failed: {e}")
            if attempt < max_retries:
                sleep_time = delay * (2 ** (attempt - 1))  # Exponential backoff
                logger.info(f"Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                logger.error(f"❌ All {max_retries} attempts failed")
                raise
        except Exception as e:
            logger.error(f"Unexpected error during scraping: {e}")
            raise


def update_matches_from_scrape(db: Session, scraped_matches: List[Dict]) -> Dict:
    """
    Compara matches scrapeados con DB y actualiza.

    Args:
        db: Database session
        scraped_matches: Lista de matches desde FIFA API

    Returns:
        Estadísticas de la actualización:
        {
            'checked': int,
            'updated': int,
            'newly_finished': int,
            'newly_finished_ids': List[str]
        }
    """
    stats = {"checked": 0, "updated": 0, "newly_finished": 0, "newly_finished_ids": []}

    for scraped in scraped_matches:
        stats["checked"] += 1

        # Buscar match en DB por fifaMatchId
        match_id = scraped.get("match_id")
        if not match_id:
            continue

        db_match = (
            db.query(sql_models.Match)
            .filter(sql_models.Match.fifaMatchId == str(match_id))
            .first()
        )

        if not db_match:
            # Match no existe en nuestra DB, skip
            continue

        # Detectar cambios
        changed = False
        newly_finished = False

        # Actualizar scores
        home_score = scraped.get("home_score")
        away_score = scraped.get("away_score")

        if home_score is not None and db_match.homeScore != home_score:
            db_match.homeScore = home_score
            changed = True

        if away_score is not None and db_match.awayScore != away_score:
            db_match.awayScore = away_score
            changed = True

        # Mapear status de FIFA a nuestro status
        fifa_status = scraped.get("match_status")
        if fifa_status is not None:
            new_status = map_fifa_status(fifa_status)

            if db_match.status != new_status:
                # Detectar si cambió a finished
                if db_match.status != "finished" and new_status == "finished":
                    newly_finished = True
                    stats["newly_finished"] += 1
                    stats["newly_finished_ids"].append(db_match.id)
                    logger.info(
                        f"🏁 Match {db_match.id} ({db_match.homeTeam} vs {db_match.awayTeam}) finished!"
                    )

                db_match.status = new_status
                changed = True

        if changed:
            db_match.updatedAt = datetime.utcnow()
            stats["updated"] += 1
            logger.debug(
                f"Updated match {db_match.id}: {db_match.homeTeam} {db_match.homeScore}-{db_match.awayScore} {db_match.awayTeam}"
            )

    db.commit()
    return stats


def calculate_points_for_matches(db: Session, match_ids: List[str]) -> int:
    """
    Calcula puntos para todas las predictions de los matches dados.

    Args:
        db: Database session
        match_ids: Lista de IDs de matches a procesar

    Returns:
        Número de predictions actualizadas
    """
    total_updated = 0

    for match_id in match_ids:
        match = (
            db.query(sql_models.Match).filter(sql_models.Match.id == match_id).first()
        )

        if not match or match.homeScore is None or match.awayScore is None:
            logger.warning(
                f"Match {match_id} has no scores, skipping points calculation"
            )
            continue

        predictions = (
            db.query(sql_models.Prediction)
            .filter(sql_models.Prediction.matchId == match_id)
            .all()
        )

        for pred in predictions:
            points, breakdown = calculate_points(
                pred.homeScore, pred.awayScore, match.homeScore, match.awayScore
            )

            pred.points = points
            pred.pointsBreakdown = breakdown
            pred.notified = False  # Marca para notificar al usuario
            pred.updatedAt = datetime.utcnow()
            total_updated += 1

        logger.info(
            f"✅ Calculated points for {len(predictions)} predictions of match {match_id}"
        )

    db.commit()
    return total_updated


def save_scraper_log(
    db: Session,
    stats: Dict,
    status: str,
    error: str = None,
    duration: float = None,
    retry_count: int = 0,
):
    """
    Guarda log de la ejecución en la DB.

    Args:
        db: Database session
        stats: Estadísticas de la ejecución
        status: 'success', 'partial', o 'failed'
        error: Mensaje de error si hubo
        duration: Duración en segundos
        retry_count: Número de reintentos realizados
    """
    log = sql_models.ScraperLog(
        id=str(uuid.uuid4()),
        executionTime=datetime.utcnow(),
        status=status,
        matchesChecked=stats.get("checked", 0),
        matchesUpdated=stats.get("updated", 0),
        matchesFinished=stats.get("newly_finished", 0),
        pointsCalculated=stats.get("points_calculated", 0),
        errorMessage=error,
        retryCount=retry_count,
        durationSeconds=duration,
    )
    db.add(log)
    db.commit()
    logger.info(f"📝 Saved scraper log: {status} - {stats}")


def scrape_and_update_matches(db: Session) -> Dict:
    """
    Función principal: scrape FIFA, actualiza matches, calcula puntos.

    Args:
        db: Database session

    Returns:
        Estadísticas de la ejecución
    """
    start_time = time.time()
    stats = {"checked": 0, "updated": 0, "newly_finished": 0, "points_calculated": 0}
    retry_count = 0

    try:
        logger.info("🚀 Starting FIFA scraper job...")

        # 1. Scrape FIFA with retries
        try:
            scraped_matches = scrape_fifa_with_retry(max_retries=3, delay=5.0)
        except Exception as e:
            # All retries failed
            retry_count = 3
            duration = time.time() - start_time
            save_scraper_log(db, stats, "failed", str(e), duration, retry_count)

            # Notify admins
            from app.services.notification_service import notify_admins_of_failure

            notify_admins_of_failure(db, str(e))

            raise

        # 2. Update matches in DB
        update_stats = update_matches_from_scrape(db, scraped_matches)
        stats.update(update_stats)

        # 3. Calculate points for newly finished matches
        if stats["newly_finished"] > 0:
            newly_finished_ids = update_stats.get("newly_finished_ids", [])
            points_calculated = calculate_points_for_matches(db, newly_finished_ids)
            stats["points_calculated"] = points_calculated

        # 4. Save success log
        duration = time.time() - start_time
        save_scraper_log(db, stats, "success", None, duration, retry_count)

        logger.info(f"✅ Scraper job completed successfully in {duration:.2f}s")
        logger.info(
            f"   Checked: {stats['checked']}, Updated: {stats['updated']}, "
            f"Finished: {stats['newly_finished']}, Points: {stats['points_calculated']}"
        )

        return stats

    except Exception as e:
        logger.error(f"❌ Scraper job failed: {e}")
        duration = time.time() - start_time
        save_scraper_log(db, stats, "failed", str(e), duration, retry_count)
        raise


if __name__ == "__main__":
    # Para testing manual
    logging.basicConfig(level=logging.INFO)

    from app.database import SessionLocal

    db = SessionLocal()
    try:
        result = scrape_and_update_matches(db)
        print(f"\n✅ Scraper completed!")
        print(f"Stats: {result}")
    except Exception as e:
        print(f"\n❌ Scraper failed: {e}")
    finally:
        db.close()

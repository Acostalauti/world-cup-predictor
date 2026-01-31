"""
Scheduler Module

Configura APScheduler para ejecutar el scraper automáticamente cada 2 horas.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging

from app.database import SessionLocal
from app.services.match_updater import scrape_and_update_matches

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = BackgroundScheduler()


def scraper_job():
    """
    Job function que ejecuta el scraper.
    Crea su propia sesión de DB y la cierra al terminar.
    """
    logger.info("🔄 Scheduler: Starting scraper job")
    db = SessionLocal()

    try:
        stats = scrape_and_update_matches(db)
        logger.info(f"✅ Scheduler: Scraper completed - {stats}")
    except Exception as e:
        logger.error(f"❌ Scheduler: Scraper job failed - {e}")
    finally:
        db.close()


def start_scheduler():
    """
    Inicia el scheduler con un job que corre cada 2 horas.
    """
    if scheduler.running:
        logger.warning("⚠️ Scheduler is already running")
        return

    # Add job: scrape every 2 hours
    scheduler.add_job(
        func=scraper_job,
        trigger=IntervalTrigger(hours=2),
        id="scraper_job",
        name="FIFA Match Scraper",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("🚀 Scheduler started - Scraper will run every 2 hours")

    # Log next run time
    job = scheduler.get_job("scraper_job")
    if job and job.next_run_time:
        logger.info(f"⏰ Next scraper run: {job.next_run_time}")


def stop_scheduler():
    """
    Detiene el scheduler de forma segura.
    """
    if not scheduler.running:
        logger.warning("⚠️ Scheduler is not running")
        return

    scheduler.shutdown(wait=True)
    logger.info("🛑 Scheduler stopped")


def get_scheduler_status():
    """
    Obtiene el estado actual del scheduler.

    Returns:
        dict con status, jobs, y next_run_time
    """
    if not scheduler.running:
        return {
            "running": False,
            "jobs": [],
            "nextRun": None,
        }

    jobs = []
    for job in scheduler.get_jobs():
        jobs.append(
            {
                "id": job.id,
                "name": job.name,
                "nextRun": job.next_run_time.isoformat() if job.next_run_time else None,
            }
        )

    return {
        "running": True,
        "jobs": jobs,
        "nextRun": jobs[0]["nextRun"] if jobs else None,
    }


def trigger_scraper_now():
    """
    Ejecuta el scraper inmediatamente (fuera de schedule).
    No afecta el schedule regular.
    """
    logger.info("🔧 Manual trigger: Running scraper now")
    scraper_job()

"""
Admin Matches Router

Endpoints para que los admins manejen matches y el scraper:
- Ver estado del scraper
- Trigger manual del scraper
- Override manual de resultados
- Recalcular puntos
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, List
from datetime import datetime

from ..database import get_db
from ..models import User, UpdateMatchResultRequest, ScraperLog
from .. import sql_models
from .auth import get_current_user
from ..services.match_updater import scrape_and_update_matches
from ..services.points_calculator import calculate_points

router = APIRouter()


def require_admin(current_user: User) -> User:
    """Helper to enforce admin role"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/admin/matches/scraping-status")
def get_scraping_status(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Dict:
    """
    Get the status of the scraper: last execution, next run, errors.

    Returns:
        - lastExecution: Last scraper log
        - recentLogs: Last 10 scraper logs
        - stats: Overall statistics
    """
    require_admin(current_user)

    # Get last execution
    last_log = (
        db.query(sql_models.ScraperLog)
        .order_by(desc(sql_models.ScraperLog.executionTime))
        .first()
    )

    # Get recent logs (last 10)
    recent_logs = (
        db.query(sql_models.ScraperLog)
        .order_by(desc(sql_models.ScraperLog.executionTime))
        .limit(10)
        .all()
    )

    # Calculate stats
    total_executions = db.query(sql_models.ScraperLog).count()
    successful_executions = (
        db.query(sql_models.ScraperLog)
        .filter(sql_models.ScraperLog.status == "success")
        .count()
    )
    failed_executions = (
        db.query(sql_models.ScraperLog)
        .filter(sql_models.ScraperLog.status == "failed")
        .count()
    )

    return {
        "lastExecution": ScraperLog.from_orm(last_log) if last_log else None,
        "recentLogs": [ScraperLog.from_orm(log) for log in recent_logs],
        "stats": {
            "totalExecutions": total_executions,
            "successfulExecutions": successful_executions,
            "failedExecutions": failed_executions,
            "successRate": (
                round(successful_executions / total_executions * 100, 2)
                if total_executions > 0
                else 0
            ),
        },
    }


@router.post("/admin/matches/trigger-update")
def trigger_scraper_update(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict:
    """
    Manually trigger the scraper to update matches from FIFA API.
    Runs in background to avoid blocking the request.

    Returns:
        - message: Confirmation message
        - triggeredAt: Timestamp of trigger
    """
    require_admin(current_user)

    # Add task to background
    background_tasks.add_task(scrape_and_update_matches, db)

    return {
        "message": "Scraper update triggered successfully",
        "triggeredAt": datetime.utcnow(),
        "triggeredBy": current_user.name,
    }


@router.post("/admin/matches/{match_id}/set-result")
def set_match_result(
    match_id: str,
    result: UpdateMatchResultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict:
    """
    Manually override a match result.
    This sets manualOverride=true to prevent scraper from overwriting.

    Args:
        match_id: Match ID to update
        result: homeScore, awayScore, status

    Returns:
        - message: Confirmation
        - match: Updated match data
        - pointsCalculated: Number of predictions that had points calculated
    """
    require_admin(current_user)

    # Get match
    match = db.query(sql_models.Match).filter(sql_models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Store old status to detect changes
    old_status = match.status
    was_finished = old_status == "finished"

    # Update match
    match.homeScore = result.homeScore
    match.awayScore = result.awayScore
    match.status = result.status
    match.manualOverride = True  # Flag as manually overridden
    match.updatedAt = datetime.utcnow()

    db.commit()
    db.refresh(match)

    points_calculated = 0

    # If match just became finished, calculate points
    if result.status == "finished" and not was_finished:
        predictions = (
            db.query(sql_models.Prediction)
            .filter(sql_models.Prediction.matchId == match_id)
            .all()
        )

        for pred in predictions:
            points, breakdown = calculate_points(
                pred.homeScore,
                pred.awayScore,
                match.homeScore,
                match.awayScore,
            )
            pred.points = points
            pred.pointsBreakdown = breakdown
            pred.notified = False  # Reset notified flag
            pred.updatedAt = datetime.utcnow()
            points_calculated += 1

        db.commit()

    return {
        "message": f"Match result updated manually by {current_user.name}",
        "match": {
            "id": match.id,
            "homeTeam": match.homeTeam,
            "awayTeam": match.awayTeam,
            "homeScore": match.homeScore,
            "awayScore": match.awayScore,
            "status": match.status,
            "manualOverride": match.manualOverride,
        },
        "pointsCalculated": points_calculated,
    }


@router.post("/admin/matches/{match_id}/recalculate-points")
def recalculate_match_points(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict:
    """
    Force recalculation of points for all predictions of a match.
    Useful if points algorithm changed or manual correction needed.

    Args:
        match_id: Match ID

    Returns:
        - message: Confirmation
        - predictionsUpdated: Number of predictions recalculated
        - match: Match info
    """
    require_admin(current_user)

    # Get match
    match = db.query(sql_models.Match).filter(sql_models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Match must be finished
    if match.status != "finished":
        raise HTTPException(
            status_code=400,
            detail="Cannot recalculate points for non-finished match",
        )

    # Get all predictions
    predictions = (
        db.query(sql_models.Prediction)
        .filter(sql_models.Prediction.matchId == match_id)
        .all()
    )

    if not predictions:
        return {
            "message": "No predictions found for this match",
            "predictionsUpdated": 0,
            "match": {
                "id": match.id,
                "homeTeam": match.homeTeam,
                "awayTeam": match.awayTeam,
                "homeScore": match.homeScore,
                "awayScore": match.awayScore,
            },
        }

    # Recalculate points
    for pred in predictions:
        points, breakdown = calculate_points(
            pred.homeScore,
            pred.awayScore,
            match.homeScore,
            match.awayScore,
        )
        pred.points = points
        pred.pointsBreakdown = breakdown
        pred.notified = False  # Reset notified flag so users get notified again
        pred.updatedAt = datetime.utcnow()

    db.commit()

    return {
        "message": f"Points recalculated for {len(predictions)} predictions",
        "predictionsUpdated": len(predictions),
        "match": {
            "id": match.id,
            "homeTeam": match.homeTeam,
            "awayTeam": match.awayTeam,
            "homeScore": match.homeScore,
            "awayScore": match.awayScore,
        },
    }

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import (
    Prediction,
    CreatePredictionRequest,
    User,
    UserRanking,
    PredictionWithMatch,
)
from ..database import get_db
from .. import crud, sql_models
from .auth import get_current_user
import uuid
from datetime import datetime, timedelta

router = APIRouter()


def is_prediction_editable(match: sql_models.Match) -> bool:
    """
    Check if predictions can still be made/edited for a match.

    Rules:
    - Match must be 'upcoming' status
    - Match date must be more than 1 hour away

    Args:
        match: Match object from database

    Returns:
        True if prediction can be made/edited, False otherwise
    """
    # Match must be upcoming
    if match.status != "upcoming":
        return False

    # Check if more than 1 hour until kickoff
    now = datetime.utcnow()
    deadline = match.date - timedelta(hours=1)

    return now < deadline


@router.get("/ranking", response_model=List[UserRanking])
def get_global_ranking(db: Session = Depends(get_db)):
    """
    Get global ranking of all players ordered by points.
    Currently using mock points since calculation is not implemented yet.
    """
    # Get all users
    users = db.query(sql_models.User).all()

    # Get prediction counts and mock points for each user
    ranking = []
    for user in users:
        predictions = (
            db.query(sql_models.Prediction)
            .filter(sql_models.Prediction.userId == user.id)
            .all()
        )

        # Count correct predictions (where points > 0)
        correct_count = sum(1 for p in predictions if p.points and p.points > 0)

        # Sum total points (mock: use random or 0)
        total_points = sum(p.points or 0 for p in predictions)

        ranking.append(
            {
                "userId": user.id,
                "name": user.name,
                "avatar": user.avatar,
                "points": total_points,
                "correctPredictions": correct_count,
                "position": 0,  # Will be assigned after sorting
            }
        )

    # Sort by points descending
    ranking.sort(key=lambda x: x["points"], reverse=True)

    # Assign positions
    for i, entry in enumerate(ranking):
        entry["position"] = i + 1

    return ranking


@router.get("/predictions", response_model=List[Prediction])
def get_predictions(
    userId: Optional[str] = Query(None),
    matchId: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get predictions filtered by userId or matchId"""
    # NOTE: current crud.get_predictions doesn't support generic filtering in one function easily
    # I should update crud.py or implement custom query here.
    # Let's implement custom query here for filter options for now.

    from .. import sql_models

    query = db.query(sql_models.Prediction)

    if userId:
        query = query.filter(sql_models.Prediction.userId == userId)

    if matchId:
        query = query.filter(sql_models.Prediction.matchId == matchId)

    return query.all()


@router.get("/predictions/detailed", response_model=List[PredictionWithMatch])
def get_predictions_detailed(
    userId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get predictions with full match data via JOIN.

    Filters:
    - userId: Filter by user (defaults to current user)
    - status: Filter by match status (upcoming/live/finished)

    Security: Users can only see their own predictions unless admin.
    """

    # Build query with JOIN
    query = db.query(sql_models.Prediction).join(
        sql_models.Match, sql_models.Prediction.matchId == sql_models.Match.id
    )

    # Security check: only own predictions unless admin
    if userId:
        if (
            current_user.role not in ["admin", "platform_admin", "group_admin"]
            and userId != current_user.id
        ):
            raise HTTPException(status_code=403, detail="Can only view own predictions")
        query = query.filter(sql_models.Prediction.userId == userId)
    else:
        # Default: only current user's predictions
        query = query.filter(sql_models.Prediction.userId == current_user.id)

    # Filter by match status if provided
    if status:
        query = query.filter(sql_models.Match.status == status)

    # Order by match date descending (most recent first)
    query = query.order_by(sql_models.Match.date.desc())

    predictions = query.all()

    # Build response with match data
    result = []
    for pred in predictions:
        match = (
            db.query(sql_models.Match)
            .filter(sql_models.Match.id == pred.matchId)
            .first()
        )
        result.append(
            PredictionWithMatch(
                id=pred.id,
                matchId=pred.matchId,
                userId=pred.userId,
                homeScore=pred.homeScore,
                awayScore=pred.awayScore,
                points=pred.points,
                pointsBreakdown=pred.pointsBreakdown,
                notified=pred.notified,
                match=match,
            )
        )

    return result


@router.post("/predictions", response_model=Prediction)
def create_prediction(
    request: CreatePredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create or update a prediction for a match.

    Validates that:
    - Match exists
    - Match is upcoming (not live or finished)
    - Deadline hasn't passed (must be >1 hour before kickoff)
    """
    match = crud.get_match(db, request.matchId)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Check if prediction is still editable
    if not is_prediction_editable(match):
        # Calculate time until/since deadline for better error message
        now = datetime.utcnow()
        deadline = match.date - timedelta(hours=1)

        if match.status != "upcoming":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot predict {match.status} matches. Match status: {match.status}",
            )
        else:
            # Deadline passed
            time_diff = now - deadline
            hours_passed = int(time_diff.total_seconds() / 3600)
            minutes_passed = int((time_diff.total_seconds() % 3600) / 60)

            raise HTTPException(
                status_code=400,
                detail=f"Prediction deadline has passed. Deadline was {hours_passed}h {minutes_passed}m ago",
            )

    prediction_id = str(uuid.uuid4())

    # Check existing logic moved to crud.create_prediction (it updates if exists)

    prediction_data = Prediction(
        id=prediction_id,  # Will be ignored if exists in crud implementation, or used if new
        matchId=request.matchId,
        userId=current_user.id,
        homeScore=request.homeScore,
        awayScore=request.awayScore,
        points=None,
    )

    saved = crud.create_prediction(db, prediction_data)
    return saved


@router.get("/predictions/unnotified", response_model=List[Prediction])
def get_unnotified_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get predictions with points that user hasn't been notified about.
    After fetching, marks them as notified.

    This is used for showing notifications in the frontend.
    """
    # Get predictions with points that haven't been notified
    predictions = (
        db.query(sql_models.Prediction)
        .filter(
            sql_models.Prediction.userId == current_user.id,
            sql_models.Prediction.points.isnot(None),
            sql_models.Prediction.notified == False,
        )
        .all()
    )

    if not predictions:
        return []

    # Mark as notified
    for pred in predictions:
        pred.notified = True

    db.commit()

    return predictions

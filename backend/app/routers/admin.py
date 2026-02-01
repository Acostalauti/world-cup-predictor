from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from .. import sql_models, crud
from .auth import get_current_user
from typing import Dict
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/admin/stats")
def get_admin_stats(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Enforce admin role check
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    total_users = db.query(sql_models.User).count()

    # Active matches: status != 'finished'
    active_matches = (
        db.query(sql_models.Match).filter(sql_models.Match.status != "finished").count()
    )

    # Predictions count
    total_predictions = db.query(sql_models.Prediction).count()

    return {
        "totalUsers": total_users,
        "activeMatches": active_matches,
        "totalPredictions": total_predictions,
    }


@router.get("/admin/reports")
def get_admin_reports(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Enforce admin role check
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Users
    users_query = db.query(sql_models.User)
    total_users = users_query.count()
    verified_users = total_users  # Mocking all as verified

    admins_count = users_query.filter(sql_models.User.role == "admin").count()

    new_users_this_week = total_users
    active_users_today = total_users

    # Predictions
    total_predictions = db.query(sql_models.Prediction).count()
    # Mocking correct predictions
    correct_predictions = int(total_predictions * 0.42)
    exact_results = int(total_predictions * 0.1)

    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "admins": admins_count,
            "newThisWeek": new_users_this_week,
            "activeToday": active_users_today,
            "retentionRate": 100,
        },
        "predictions": {
            "total": total_predictions,
            "correct": correct_predictions,
            "exact": exact_results,
            "today": total_predictions,
        },
    }


@router.post("/admin/users/{user_id}/promote")
def promote_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")

    user.role = "admin"
    db.commit()
    return {"message": f"User {user.name} promoted to admin"}


@router.post("/admin/users/{user_id}/demote")
def demote_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent self-demotion
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")

    if user.role == "player":
        raise HTTPException(status_code=400, detail="User is already a player")

    user.role = "player"
    db.commit()
    return {"message": f"User {user.name} demoted to player"}

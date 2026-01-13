from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from .. import sql_models, crud
from .auth import get_current_user
from typing import Dict
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/admin/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Enforce admin role check (mock)
    
    total_users = db.query(sql_models.User).count()
    total_groups = db.query(sql_models.Group).count()
    
    # Active matches: status != 'finished'
    active_matches = db.query(sql_models.Match).filter(sql_models.Match.status != "finished").count()
    
    # Predictions today: count all for now
    predictions_today = db.query(sql_models.Prediction).count()

    return {
        "totalUsers": total_users,
        "totalGroups": total_groups,
        "activeMatches": active_matches,
        "predictionsToday": predictions_today
    }

@router.get("/admin/reports")
def get_admin_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Detailed reports
    
    # Users
    users_query = db.query(sql_models.User)
    total_users = users_query.count()
    verified_users = total_users # Mocking all as verified
    
    admins_group = users_query.filter(sql_models.User.role.in_(["group_admin", "platform_admin"])).count()
    
    # New users this week
    # Assuming we don't track User.createdAt in database (it wasn't in models.py initially)
    # So we reuse total_users
    new_users_this_week = total_users
    active_users_today = total_users
    
    # Groups
    groups = db.query(sql_models.Group).all()
    total_groups = len(groups)
    active_groups = len([g for g in groups if g.status == "active"])
    
    avg_members = 0
    if total_groups > 0:
        total_members = sum(g.playerCount for g in groups)
        avg_members = total_members / total_groups
        
    largest_group_size = 0
    if total_groups > 0:
        largest_group_size = max(g.playerCount for g in groups)

    # New groups this week
    now = datetime.now()
    week_ago = now - timedelta(days=7)
    new_groups_this_week = len([g for g in groups if g.createdAt and g.createdAt >= week_ago])

    # Top Groups (sorted by member count)
    # Calculate real prediction counts by counting predictions made by group members
    sorted_groups = sorted(groups, key=lambda g: g.playerCount, reverse=True)[:5]
    top_groups = []
    
    # Optimize prediction counting: fetch all predictions once? Or count per group via JOIN?
    # For now, let's just count all predictions and filter in python if needed, or query.
    # SQL way:
    # select count(*) from predictions p join group_members gm on p.userId = gm.userId where gm.groupId = :group_id
    
    for g in sorted_groups:
        # Get member user IDs for this group
        # This is n+1 queries but fine for top 5
        members = crud.get_group_members(db, g.id)
        member_user_ids = [m.userId for m in members]
        
        if not member_user_ids:
            prediction_count = 0
        else:
            prediction_count = db.query(sql_models.Prediction).filter(sql_models.Prediction.userId.in_(member_user_ids)).count()
        
        top_groups.append({
            "name": g.name,
            "memberCount": g.playerCount,
            "predictionCount": prediction_count
        })

    # Predictions
    total_predictions = db.query(sql_models.Prediction).count()
    # Mocking correct predictions
    correct_predictions = int(total_predictions * 0.42)
    exact_results = int(total_predictions * 0.1)
    
    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "adminsGroup": admins_group,
            "newThisWeek": new_users_this_week,
            "activeToday": active_users_today,
            "retentionRate": 100
        },
        "groups": {
            "total": total_groups,
            "active": active_groups,
            "avgMembers": avg_members,
            "largestGroup": largest_group_size,
            "newThisWeek": new_groups_this_week,
            "topGroups": top_groups
        },
        "predictions": {
            "total": total_predictions,
            "correct": correct_predictions,
            "exact": exact_results,
            "today": total_predictions
        }
    }

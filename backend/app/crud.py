from sqlalchemy.orm import Session
from . import sql_models, models, utils
import uuid
from datetime import datetime

# Users
def get_user(db: Session, user_id: str):
    return db.query(sql_models.User).filter(sql_models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(sql_models.User).filter(sql_models.User.email == email).first()

def create_user(db: Session, user: models.User, password: str = None):
    # Check if user exists
    db_user = sql_models.User(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar
    )
    if password:
        db_user.password_hash = utils.get_password_hash(password)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Groups
def get_group(db: Session, group_id: str):
    return db.query(sql_models.Group).filter(sql_models.Group.id == group_id).first()

def get_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(sql_models.Group).offset(skip).limit(limit).all()

def create_group(db: Session, group: models.Group):
    db_group = sql_models.Group(
        id=group.id,
        name=group.name,
        description=group.description,
        adminId=group.adminId,
        playerCount=group.playerCount,
        inviteCode=group.inviteCode,
        inviteLink=group.inviteLink,
        scoringSystem=group.scoringSystem,
        createdAt=group.createdAt,
        status=group.status
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def add_group_member(db: Session, group_id: str, user_id: str, is_admin: bool = False, points: int = 0):
    db_member = sql_models.GroupMember(
        userId=user_id,
        groupId=group_id,
        isAdmin=is_admin,
        points=points,
        joinedAt=datetime.utcnow()
    )
    db.add(db_member)
    
    # Update player count
    group = get_group(db, group_id)
    if group:
        group.playerCount += 1
        
    db.commit()
    return db_member

def get_group_members(db: Session, group_id: str):
    return db.query(sql_models.GroupMember).filter(sql_models.GroupMember.groupId == group_id).all()

# Matches
def get_matches(db: Session, status: str = None):
    query = db.query(sql_models.Match)
    if status:
        query = query.filter(sql_models.Match.status == status)
    return query.all()

def get_match(db: Session, match_id: str):
    return db.query(sql_models.Match).filter(sql_models.Match.id == match_id).first()

def create_match(db: Session, match: models.Match):
    db_match = sql_models.Match(
        id=match.id,
        homeTeam=match.homeTeam,
        awayTeam=match.awayTeam,
        homeFlag=match.homeFlag,
        awayFlag=match.awayFlag,
        date=match.date,
        time=match.time,
        status=match.status,
        homeScore=match.homeScore,
        awayScore=match.awayScore,
        matchNumber=match.matchNumber,
        stage=match.stage,
        group=match.group,
        stadium=match.stadium,
        city=match.city
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def update_match(db: Session, match_id: str, **kwargs):
    db_match = get_match(db, match_id)
    if not db_match:
        return None
        
    for key, value in kwargs.items():
        setattr(db_match, key, value)
    
    db.commit()
    db.refresh(db_match)
    return db_match

# Predictions
def get_prediction(db: Session, match_id: str, user_id: str):
    return db.query(sql_models.Prediction).filter(
        sql_models.Prediction.matchId == match_id,
        sql_models.Prediction.userId == user_id
    ).first()

def create_prediction(db: Session, prediction: models.Prediction):
    existing = get_prediction(db, prediction.matchId, prediction.userId)
    if existing:
        existing.homeScore = prediction.homeScore
        existing.awayScore = prediction.awayScore
        db.commit()
        db.refresh(existing)
        return existing
        
    db_prediction = sql_models.Prediction(
        id=prediction.id,
        matchId=prediction.matchId,
        userId=prediction.userId,
        homeScore=prediction.homeScore,
        awayScore=prediction.awayScore,
        points=prediction.points,
        createdAt=datetime.utcnow()
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

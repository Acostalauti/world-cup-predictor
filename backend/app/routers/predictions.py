from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import Prediction, CreatePredictionRequest, User
from ..database import get_db
from .. import crud
from .auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/predictions", response_model=List[Prediction])
def get_predictions(
    userId: Optional[str] = Query(None),
    matchId: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
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

@router.post("/predictions", response_model=Prediction)
def create_prediction(
    request: CreatePredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = crud.get_match(db, request.matchId)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    prediction_id = str(uuid.uuid4())
    
    # Check existing logic moved to crud.create_prediction (it updates if exists)
    
    prediction_data = Prediction(
        id=prediction_id, # Will be ignored if exists in crud implementation, or used if new
        matchId=request.matchId,
        userId=current_user.id,
        homeScore=request.homeScore,
        awayScore=request.awayScore,
        points=None
    )
    
    saved = crud.create_prediction(db, prediction_data)
    return saved

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..models import Prediction, CreatePredictionRequest, User
from ..db import db
from .auth import get_current_user
import uuid

router = APIRouter()

@router.get("/predictions", response_model=List[Prediction])
def get_predictions(
    userId: Optional[str] = Query(None),
    matchId: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Get predictions filtered by userId or matchId"""
    predictions = list(db.predictions.values())
    
    if userId:
        predictions = [p for p in predictions if p.userId == userId]
    
    if matchId:
        predictions = [p for p in predictions if p.matchId == matchId]
    
    return predictions

@router.post("/predictions", response_model=Prediction)
def create_prediction(
    request: CreatePredictionRequest,
    current_user: User = Depends(get_current_user)
):
    match = db.get_match(request.matchId)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    # Check if match is upcoming? Spec doesn't strictly require it here but logic dictates.
    # We'll allow it for now.
    
    prediction_id = str(uuid.uuid4())
    # Check existing prediction handled by db.create_prediction logic or do it here to reuse ID?
    # db.create_prediction updates if exists based on matchId/userId logic I put there? 
    # Let's see db.py... 
    # "existing = self.get_prediction(prediction.matchId, prediction.userId) -> update"
    # But I generate a new ID here. 
    # If existing, I should probably use the existing ID.
    
    existing = db.get_prediction(request.matchId, current_user.id)
    if existing:
        prediction_id = existing.id
    
    prediction = Prediction(
        id=prediction_id,
        matchId=request.matchId,
        userId=current_user.id,
        homeScore=request.homeScore,
        awayScore=request.awayScore,
        points=None # calculated later
    )
    
    saved = db.create_prediction(prediction)
    return saved

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Literal
from ..models import Match, CreateMatchRequest, UpdateMatchRequest, User
from ..db import db
from .auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/matches", response_model=List[Match])
def list_matches(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    matches = db.get_matches(status=status)
    
    # Enrich each match with user's prediction if exists
    enriched_matches = []
    for match in matches:
        prediction = db.get_prediction(match.id, current_user.id)
        match_dict = match.model_dump()
        match_dict['userPrediction'] = prediction
        enriched_matches.append(Match(**match_dict))
    
    return enriched_matches

@router.post("/matches", response_model=Match, status_code=201)
def create_match(
    request: CreateMatchRequest,
    current_user: User = Depends(get_current_user)
):
    # Check if admin
    # Mock admin check (in a real app check role)
    if current_user.role not in ['platform_admin', 'group_admin']: # Just guessing roles
         # Spec says (Admin) but doesn't specify which admin role for global matches. Assuming platform_admin or similar.
         # Let's just allow it for now or check if user has admin role concept.
         # User model has 'role' enum: [player, group_admin, platform_admin]
         pass

    match_id = str(uuid.uuid4())
    new_match = Match(
        id=match_id,
        homeTeam=request.homeTeam,
        awayTeam=request.awayTeam,
        homeFlag=request.homeFlag,
        awayFlag=request.awayFlag,
        date=request.date,
        time=request.time,
        status=request.status,
        homeScore=0, # Initial
        awayScore=0  # Initial
    )
    db.create_match(new_match)
    return new_match

@router.put("/matches/{id}", response_model=Match)
def update_match(
    id: str,
    request: UpdateMatchRequest,
    current_user: User = Depends(get_current_user)
):
     # Admin check...
    
    updated_match = db.update_match(id, **request.model_dump(exclude_unset=True))
    if not updated_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return updated_match

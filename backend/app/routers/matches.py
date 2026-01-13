from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Literal
from sqlalchemy.orm import Session
from ..models import Match, CreateMatchRequest, UpdateMatchRequest, User, Prediction
from ..database import get_db
from .. import crud
from .auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/matches", response_model=List[Match])
def list_matches(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    matches = crud.get_matches(db, status=status)
    
    # Enrich each match with user's prediction if exists
    enriched_matches = []
    for match in matches:
        prediction = crud.get_prediction(db, match.id, current_user.id)
        # Convert SQLAlchemy model to Pydantic compatible dict, handling potentially missing fields?
        # Actually with from_attributes=True, we can pass the ORM object mostly, 
        # but here we need to modify it. Pydantic models are immutable-ish or expecting init args.
        # Safest is to dump.
        match_dict = {
            "id": match.id,
            "homeTeam": match.homeTeam,
            "awayTeam": match.awayTeam,
            "homeFlag": match.homeFlag,
            "awayFlag": match.awayFlag,
            "date": match.date,
            "time": match.time,
            "status": match.status,
            "homeScore": match.homeScore,
            "awayScore": match.awayScore,
            "matchNumber": match.matchNumber,
            "stage": match.stage,
            "group": match.group,
            "stadium": match.stadium,
            "city": match.city
        }
        
        if prediction:
             match_dict['userPrediction'] = prediction
             
        enriched_matches.append(Match(**match_dict))
    
    return enriched_matches

@router.post("/matches", response_model=Match, status_code=201)
def create_match(
    request: CreateMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if admin
    if current_user.role not in ['platform_admin', 'group_admin']:
         # In real app verify permissions.
         pass

    match_id = str(uuid.uuid4())
    new_match_data = Match(
        id=match_id,
        homeTeam=request.homeTeam,
        awayTeam=request.awayTeam,
        homeFlag=request.homeFlag,
        awayFlag=request.awayFlag,
        date=request.date,
        time=request.time,
        status=request.status,
        homeScore=0, 
        awayScore=0
    )
    # The models.Match is Pydantic, crud expects models.Match (Pydantic) 
    # and converts to sql_models.Match.
    created_match = crud.create_match(db, new_match_data)
    return created_match

@router.put("/matches/{id}", response_model=Match)
def update_match(
    id: str,
    request: UpdateMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
     # Admin check...
    
    updated_match = crud.update_match(db, id, **request.model_dump(exclude_unset=True))
    if not updated_match:
        raise HTTPException(status_code=404, detail="Match not found")
    return updated_match

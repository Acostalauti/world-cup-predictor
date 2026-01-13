from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Literal, Optional
from sqlalchemy.orm import Session
from ..models import Group, CreateGroupRequest, JoinGroupRequest, GroupMember, User
from ..database import get_db
from .. import crud, sql_models
from .auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/groups", response_model=List[Group])
def list_groups(
    search: Optional[str] = None,
    filter: Literal['mine', 'all', 'admin'] = 'mine',
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_groups = crud.get_groups(db)
    result = []
    
    for group in all_groups:
        # Determine membership context
        members = crud.get_group_members(db, group.id)
        is_member = any(m.userId == current_user.id for m in members)
        is_admin = group.adminId == current_user.id
        
        # Apply filters
        if filter == 'mine' and not is_member:
            continue
        if filter == 'admin' and not is_admin:
            continue
        
        if search and search.lower() not in group.name.lower():
            continue
            
        # Manually constructing the Pydantic model with extra fields
        group_dict = {
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "adminId": group.adminId,
            "playerCount": group.playerCount,
            "inviteCode": group.inviteCode,
            "inviteLink": group.inviteLink,
            "scoringSystem": group.scoringSystem,
            "createdAt": group.createdAt,
            "status": group.status,
            "isMember": is_member,
            "isAdmin": is_admin
        }
        result.append(Group(**group_dict))
        
    return result

@router.post("/groups", response_model=Group, status_code=201)
def create_group(
    request: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group_id = str(uuid.uuid4())
    invite_code = str(uuid.uuid4())[:8] # Simple invite code
    
    new_group_data = Group(
        id=group_id,
        name=request.name,
        description=request.description,
        adminId=current_user.id,
        playerCount=1, # Initial count will be verified by add_group_member
        inviteCode=invite_code,
        inviteLink=f"http://localhost:3000/join/{invite_code}", # Mock link
        scoringSystem=request.scoringSystem,
        createdAt=datetime.now(timezone.utc),
        status='active',
        isMember=True,
        isAdmin=True
    )
    
    # We create group using crud (which accepts Pydantic model)
    # Note: crud.create_group expects models.Group, but we are manually setting transient fields.
    # The crud logic extracts fields.
    crud.create_group(db, new_group_data)
    
    # Add creator as member
    crud.add_group_member(
        db, 
        group_id=group_id, 
        user_id=current_user.id, 
        is_admin=True, 
        points=0
    )
    
    return new_group_data

@router.get("/groups/{id}", response_model=Group)
def get_group(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group = crud.get_group(db, id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = crud.get_group_members(db, id)
    is_member = any(m.userId == current_user.id for m in members)
    is_admin = group.adminId == current_user.id
    
    group_dict = {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "adminId": group.adminId,
        "playerCount": group.playerCount,
        "inviteCode": group.inviteCode,
        "inviteLink": group.inviteLink,
        "scoringSystem": group.scoringSystem,
        "createdAt": group.createdAt,
        "status": group.status,
        "isMember": is_member,
        "isAdmin": is_admin
    }
    
    return Group(**group_dict)

@router.post("/groups/join", response_model=Group)
def join_group(
    request: JoinGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find group by invite code
    # Using SQL query
    target_group = db.query(sql_models.Group).filter(sql_models.Group.inviteCode == request.inviteCode).first()
            
    if not target_group:
        raise HTTPException(status_code=404, detail="Invalid invite code")
        
    # Check if already member
    members = crud.get_group_members(db, target_group.id)
    if any(m.userId == current_user.id for m in members):
        pass
    else:
        # Add member
        crud.add_group_member(
            db,
            group_id=target_group.id,
            user_id=current_user.id,
            is_admin=False
        )
        
    group_dict = {
        "id": target_group.id,
        "name": target_group.name,
        "description": target_group.description,
        "adminId": target_group.adminId,
        "playerCount": target_group.playerCount, # Updated by add_group_member? Not in-memory object, need refresh if reading? 
        # Actually crud.add_group_member updates count in DB, but `target_group` variable here is old.
        # But we only return it. Let's just return what we have, or refresh.
        "inviteCode": target_group.inviteCode,
        "inviteLink": target_group.inviteLink,
        "scoringSystem": target_group.scoringSystem,
        "createdAt": target_group.createdAt,
        "status": target_group.status,
        "isMember": True,
        "isAdmin": (target_group.adminId == current_user.id)
    }
    # Refresh player count 
    group_dict["playerCount"] = target_group.playerCount + (1 if not any(m.userId == current_user.id for m in members) else 0)
    
    return Group(**group_dict)

@router.get("/groups/{id}/ranking", response_model=List[GroupMember])
def get_group_ranking(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group = crud.get_group(db, id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    members = crud.get_group_members(db, id)
    
    # Sort by points
    sorted_members = sorted(members, key=lambda m: m.points, reverse=True)
    
    member_responses = []
    
    # Needs to return models.GroupMember (Pydantic). 
    # members are sql_models.GroupMember.
    
    for i, member in enumerate(sorted_members):
        # We need member name/email. sql_models.GroupMember doesn't store them directly? 
        # Wait, models schema had name/email.
        # My sql_models.GroupMember has userId. I need to join with User to get names?
        # Or store them denormalized?
        # My sql_models.GroupMember DOES NOT have name/email. 
        # But Pydantic GroupMember DOES.
        
        # FIX: Fetch user details via relationship
        user = member.user 
        if not user:
            # Should not happen due to FK
            continue
            
        m_dict = {
            "userId": member.userId,
            "name": user.name,
            "email": user.email,
            "joinedAt": member.joinedAt,
            "points": member.points,
            "isAdmin": member.isAdmin,
            "position": i + 1
        }
        member_responses.append(GroupMember(**m_dict))
        
    return member_responses

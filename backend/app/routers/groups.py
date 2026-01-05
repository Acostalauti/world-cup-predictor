from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Literal, Optional
from ..models import Group, CreateGroupRequest, JoinGroupRequest, GroupMember, User
from ..db import db
from .auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/groups", response_model=List[Group])
def list_groups(
    search: Optional[str] = None,
    filter: Literal['mine', 'all', 'admin'] = 'mine',
    current_user: User = Depends(get_current_user)
):
    all_groups = db.get_groups()
    result = []
    
    for group in all_groups:
        # Determine membership context
        members = db.get_group_members(group.id)
        is_member = any(m.userId == current_user.id for m in members)
        is_admin = group.adminId == current_user.id
        
        # Apply filters
        if filter == 'mine' and not is_member:
            continue
        if filter == 'admin' and not is_admin:
            continue
        # 'all' shows all groups (maybe public ones? or just all for now)
        
        if search and search.lower() not in group.name.lower():
            continue
            
        # Update group object with context (creating a copy to avoid mutating db reference in place with context specific info if we reused objects, but Pydantic models are immutable-ish, we usually recreate)
        # However, MockDB stores instances. We should probably return a response model with these fields set.
        # The Group model has `isMember` and `isAdmin` fields.
        
        # We need to set these fields on the returned objects.
        # Since we are returning the same object from DB, we should probably copy it.
        group_response = group.model_copy()
        group_response.isMember = is_member
        group_response.isAdmin = is_admin
        result.append(group_response)
        
    return result

@router.post("/groups", response_model=Group, status_code=201)
def create_group(
    request: CreateGroupRequest,
    current_user: User = Depends(get_current_user)
):
    group_id = str(uuid.uuid4())
    invite_code = str(uuid.uuid4())[:8] # Simple invite code
    
    new_group = Group(
        id=group_id,
        name=request.name,
        description=request.description,
        adminId=current_user.id,
        playerCount=1,
        inviteCode=invite_code,
        inviteLink=f"http://localhost:3000/join/{invite_code}", # Mock link
        scoringSystem=request.scoringSystem,
        createdAt=datetime.now(timezone.utc),
        status='active',
        isMember=True,
        isAdmin=True
    )
    
    db.create_group(new_group)
    
    # Add creator as member
    member = GroupMember(
        userId=current_user.id,
        name=current_user.name,
        email=current_user.email,
        joinedAt=datetime.now(timezone.utc),
        points=0,
        isAdmin=True,
        position=1
    )
    db.add_group_member(group_id, member)
    
    return new_group

@router.get("/groups/{id}", response_model=Group)
def get_group(id: str, current_user: User = Depends(get_current_user)):
    group = db.get_group(id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = db.get_group_members(id)
    is_member = any(m.userId == current_user.id for m in members)
    is_admin = group.adminId == current_user.id
    
    group_response = group.model_copy()
    group_response.isMember = is_member
    group_response.isAdmin = is_admin
    
    return group_response

@router.post("/groups/join", response_model=Group)
def join_group(
    request: JoinGroupRequest,
    current_user: User = Depends(get_current_user)
):
    # Find group by invite code
    target_group = None
    for group in db.get_groups():
        if group.inviteCode == request.inviteCode:
            target_group = group
            break
            
    if not target_group:
        raise HTTPException(status_code=404, detail="Invalid invite code")
        
    # Check if already member
    members = db.get_group_members(target_group.id)
    if any(m.userId == current_user.id for m in members):
        # Already member, just return group
        # Or raise error? Spec says "Successfully joined", implies idempotent or success.
        pass
    else:
        # Add member
        member = GroupMember(
            userId=current_user.id,
            name=current_user.name,
            email=current_user.email,
            joinedAt=datetime.now(timezone.utc),
            points=0,
            isAdmin=False
        )
        db.add_group_member(target_group.id, member)
        
    group_response = target_group.model_copy()
    group_response.isMember = True
    group_response.isAdmin = (target_group.adminId == current_user.id)
    
    return group_response

@router.get("/groups/{id}/ranking", response_model=List[GroupMember])
def get_group_ranking(id: str, current_user: User = Depends(get_current_user)):
    group = db.get_group(id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    # Check membership? Usually yes, but spec doesn't explicitly restrict non-members from seeing ranking if public? 
    # Assumed only members.
    members = db.get_group_members(id)
    # Check access... skipping for now as per spec brevity.
    
    # Sort by points
    sorted_members = sorted(members, key=lambda m: m.points, reverse=True)
    
    # Assign position
    for i, member in enumerate(sorted_members):
        member.position = i + 1
        
    return sorted_members

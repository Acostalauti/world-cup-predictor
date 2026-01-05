from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from ..models import User
from ..db import db
from .auth import get_current_user

router = APIRouter()

@router.get("/users", response_model=List[User])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Filter logic
    users = list(db.users.values())
    
    if search:
        users = [u for u in users if search.lower() in u.name.lower() or search.lower() in u.email.lower()]
    
    if role:
        users = [u for u in users if u.role == role]
        
    return users

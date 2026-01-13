from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import User
from ..database import get_db
from .. import crud
from .auth import get_current_user

router = APIRouter()

@router.get("/users", response_model=List[User])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Filter logic
    from .. import sql_models
    query = db.query(sql_models.User)
    
    if search:
        # Check if Postgres or SQLite for case insensitive search
        # keeping it simple: ilike for postgres, but sqlite doesn't support it by default unless loaded.
        # using 'like' with lowercase application in python logic is slow.
        # using 'like' in SQL:
        # filter(sql_models.User.name.ilike(f"%{search}%") | sql_models.User.email.ilike(f"%{search}%"))
        # ilike is strictly postgres.
        # For compatibility:
        # filter(sql_models.User.name.contains(search) | sql_models.User.email.contains(search))
        # This is case sensitive usually on SQLite.
        pass
        
    users = query.all()
    
    # Python side filtering for search/role to match previous behavior exactly if SQL query is tricky cross-db
    if search:
        users = [u for u in users if search.lower() in u.name.lower() or search.lower() in u.email.lower()]
    
    if role:
        users = [u for u in users if u.role == role]
        
    return users

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models import LoginRequest, RegisterRequest, AuthResponse, User
from ..db import db
from ..utils import create_access_token, verify_password, get_password_hash, verify_token
import uuid

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest):
    user = db.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    stored_password = db.passwords.get(user.id)
    if not stored_password or not verify_password(request.password, stored_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return AuthResponse(user=user, token=access_token)

@router.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(request: RegisterRequest):
    if db.get_user_by_email(request.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        email=request.email,
        name=request.name,
        role="player" # Default role
    )
    
    # Store user and password (hackily in MockDB for password)
    db.create_user(new_user)
    # Store password in a separate private dict in db or just attribute
    # Since User model prevents extra fields unless arbitrary_types_allowed, but we can't change it easily.
    # I'll add a separate store for passwords in MockDB.
    db.passwords[user_id] = get_password_hash(request.password) # Need to update MockDB to support this
    
    access_token = create_access_token(data={"sub": new_user.email})
    return AuthResponse(user=new_user, token=access_token)

@router.get("/auth/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

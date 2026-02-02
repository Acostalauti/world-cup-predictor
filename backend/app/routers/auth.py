from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from ..models import LoginRequest, RegisterRequest, AuthResponse, User
from ..database import get_db
from .. import crud
from ..utils import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token,
)
from ..oauth import oauth, validate_email_domain
import uuid
import os

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
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
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check password hash (stored in user object in DB)
    if not user.password_hash or not verify_password(
        request.password, user.password_hash
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.email})
    return AuthResponse(user=user, token=access_token)


@router.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=request.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user_id = str(uuid.uuid4())
    new_user_data = User(
        id=user_id,
        email=request.email,
        name=request.name,
        role="player",  # Default role
    )

    # Create user in DB with password
    created_user = crud.create_user(db, user=new_user_data, password=request.password)

    access_token = create_access_token(data={"sub": created_user.email})
    return AuthResponse(user=created_user, token=access_token)


@router.get("/auth/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# ============================================
# Google OAuth Endpoints
# ============================================


@router.get("/auth/google/login")
async def google_login(request: Request):
    """
    Redirect to Google OAuth login page
    """
    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback"
    )
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Google OAuth callback
    Receives authorization code, exchanges for token, creates/logs in user
    """
    try:
        # Get token from Google
        token = await oauth.google.authorize_access_token(request)

        # Get user info from Google
        user_info = token.get("userinfo")
        if not user_info:
            raise HTTPException(
                status_code=400, detail="Failed to get user info from Google"
            )

        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")

        # Validate email domain
        if not validate_email_domain(email):
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
            return RedirectResponse(url=f"{frontend_url}/auth?error=domain_not_allowed")

        # Check if user exists
        user = crud.get_user_by_email(db, email=email)

        if not user:
            # Create new user (automatic registration)
            user_id = str(uuid.uuid4())
            new_user_data = User(
                id=user_id,
                email=email,
                name=name or "Usuario",
                role="player",
                avatar=picture,
            )
            # Create without password (OAuth user)
            user = crud.create_user(db, user=new_user_data, password=None)
        else:
            # Update avatar if changed
            if picture and user.avatar != picture:
                db_user = (
                    db.query(crud.sql_models.User)
                    .filter(crud.sql_models.User.id == user.id)
                    .first()
                )
                if db_user:
                    db_user.avatar = picture
                    db.commit()
                    db.refresh(db_user)

        # Create JWT token
        access_token = create_access_token(data={"sub": user.email})

        # Redirect to frontend with token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?token={access_token}"
        )

    except Exception as e:
        print(f"OAuth error: {str(e)}")
        import traceback

        traceback.print_exc()
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
        return RedirectResponse(url=f"{frontend_url}/auth?error=oauth_failed")

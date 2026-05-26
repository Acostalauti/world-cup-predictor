from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr
from datetime import datetime, date


# User Models
class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal["player", "admin", "platform_admin", "group_admin"]
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


# Prediction Models
class Prediction(BaseModel):
    id: str
    matchId: str
    userId: str
    homeScore: int
    awayScore: int
    points: Optional[int] = None
    pointsBreakdown: Optional[str] = None  # 'exact_result', 'winner_and_goal_diff', etc
    notified: bool = False

    class Config:
        from_attributes = True


class PredictionWithMatch(BaseModel):
    """Prediction with full match data (for detailed predictions view)"""

    id: str
    matchId: str
    userId: str
    homeScore: int
    awayScore: int
    points: Optional[int] = None
    pointsBreakdown: Optional[str] = None
    notified: bool = False
    match: "Match"  # Full match object included (forward reference)

    class Config:
        from_attributes = True


# Match Models
class Match(BaseModel):
    id: str
    homeTeam: str
    awayTeam: str
    homeFlag: Optional[str] = None
    awayFlag: Optional[str] = None
    date: datetime  # Changed from date to datetime
    time: Optional[str] = None
    status: Literal["upcoming", "live", "finished"]
    homeScore: Optional[int] = None
    awayScore: Optional[int] = None
    matchNumber: Optional[int] = None
    stage: Optional[str] = None
    group: Optional[str] = None
    stadium: Optional[str] = None
    city: Optional[str] = None
    fifaMatchId: Optional[str] = None
    manualOverride: bool = False
    updatedAt: Optional[datetime] = None
    userPrediction: Optional[Prediction] = None
    editable: Optional[bool] = (
        None  # Computed field - if prediction deadline hasn't passed
    )

    class Config:
        from_attributes = True


# Ranking Model
class UserRanking(BaseModel):
    userId: str
    name: str
    avatar: Optional[str] = None
    points: int
    position: int
    correctPredictions: int

    class Config:
        from_attributes = True


# Auth Models
class AuthResponse(BaseModel):
    user: User
    token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class CreateMatchRequest(BaseModel):
    homeTeam: str
    awayTeam: str
    homeFlag: Optional[str] = None
    awayFlag: Optional[str] = None
    date: datetime  # Changed from date to datetime
    time: Optional[str] = None
    status: Literal["upcoming", "live", "finished"]


class UpdateMatchRequest(BaseModel):
    status: Optional[str] = None
    homeScore: Optional[int] = None
    awayScore: Optional[int] = None


class CreatePredictionRequest(BaseModel):
    matchId: str
    homeScore: int
    awayScore: int


# Scraper Models
class ScraperLog(BaseModel):
    """Log de ejecución del scraper"""

    id: str
    executionTime: datetime
    status: Literal["success", "partial", "failed"]
    matchesChecked: int = 0
    matchesUpdated: int = 0
    matchesFinished: int = 0
    pointsCalculated: int = 0
    errorMessage: Optional[str] = None
    retryCount: int = 0
    durationSeconds: Optional[float] = None
    createdAt: datetime

    class Config:
        from_attributes = True


class UpdateMatchResultRequest(BaseModel):
    """Request para actualizar resultado de un match manualmente"""

    homeScore: int
    awayScore: int
    status: Literal["upcoming", "live", "finished"]

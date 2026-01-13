from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

# User Models
class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal['player', 'group_admin', 'platform_admin']
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
    
    class Config:
        from_attributes = True

# Match Models
class Match(BaseModel):
    id: str
    homeTeam: str
    awayTeam: str
    homeFlag: Optional[str] = None
    awayFlag: Optional[str] = None
    date: date
    time: Optional[str] = None
    status: Literal['upcoming', 'live', 'finished']
    homeScore: Optional[int] = None
    awayScore: Optional[int] = None
    matchNumber: Optional[int] = None
    stage: Optional[str] = None
    group: Optional[str] = None
    stadium: Optional[str] = None
    city: Optional[str] = None
    userPrediction: Optional[Prediction] = None
    
    class Config:
        from_attributes = True

# Group Models
class Group(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    adminId: str
    playerCount: int = 0
    inviteCode: str
    inviteLink: Optional[str] = None
    scoringSystem: Literal['classic', 'extended', 'simple']
    createdAt: datetime
    status: Literal['active', 'inactive']
    isMember: Optional[bool] = False
    isAdmin: Optional[bool] = False

    class Config:
        from_attributes = True

class GroupMember(BaseModel):
    userId: str
    name: str
    email: str
    joinedAt: datetime
    points: int = 0
    isAdmin: bool = False
    position: Optional[int] = None
    
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

class CreateGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None
    scoringSystem: Literal['classic', 'extended', 'simple']

class JoinGroupRequest(BaseModel):
    inviteCode: str

class CreateMatchRequest(BaseModel):
    homeTeam: str
    awayTeam: str
    homeFlag: Optional[str] = None
    awayFlag: Optional[str] = None
    date: date
    time: Optional[str] = None
    status: Literal['upcoming', 'live', 'finished']

class UpdateMatchRequest(BaseModel):
    status: Optional[str] = None
    homeScore: Optional[int] = None
    awayScore: Optional[int] = None

class CreatePredictionRequest(BaseModel):
    matchId: str
    homeScore: int
    awayScore: int

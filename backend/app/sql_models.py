from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="player")
    avatar = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Adding simple auth support

    # Relationships
    predictions = relationship("Prediction", back_populates="user")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    homeTeam = Column(String, nullable=False)
    awayTeam = Column(String, nullable=False)
    homeFlag = Column(String, nullable=True)
    awayFlag = Column(String, nullable=True)
    date = Column(DateTime, nullable=False)  # Changed to DateTime for full timestamp
    time = Column(
        String, nullable=True
    )  # Deprecated, keeping for backward compatibility
    status = Column(String, default="upcoming")
    homeScore = Column(Integer, nullable=True)
    awayScore = Column(Integer, nullable=True)

    # New fields
    matchNumber = Column(Integer, nullable=True)
    stage = Column(String, nullable=True)
    group = Column(String, nullable=True)
    stadium = Column(String, nullable=True)
    city = Column(String, nullable=True)
    fifaMatchId = Column(String, nullable=True, unique=True)  # ID from FIFA API
    manualOverride = Column(Boolean, default=False)  # Flag for manual result entry
    updatedAt = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # Relationships
    predictions = relationship("Prediction", back_populates="match")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, index=True)
    matchId = Column(String, ForeignKey("matches.id"))
    userId = Column(String, ForeignKey("users.id"))
    homeScore = Column(Integer, nullable=False)
    awayScore = Column(Integer, nullable=False)
    points = Column(Integer, nullable=True)
    pointsBreakdown = Column(
        String, nullable=True
    )  # 'exact_result', 'winner_and_goal_diff', etc
    notified = Column(Boolean, default=False)  # Has user been notified of points?
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # Relationships
    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")


class ScraperLog(Base):
    """Log de ejecuciones del scraper de FIFA"""

    __tablename__ = "scraper_logs"

    id = Column(String, primary_key=True, index=True)
    executionTime = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)  # 'success', 'partial', 'failed'
    matchesChecked = Column(Integer, default=0)
    matchesUpdated = Column(Integer, default=0)
    matchesFinished = Column(Integer, default=0)  # Cuántos cambiaron a finished
    pointsCalculated = Column(Integer, default=0)  # Cuántas predictions se calcularon
    errorMessage = Column(String, nullable=True)
    retryCount = Column(Integer, default=0)
    durationSeconds = Column(Float, nullable=True)
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

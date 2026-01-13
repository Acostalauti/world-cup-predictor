from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Date
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
    password_hash = Column(String, nullable=True) # Adding simple auth support

    # Relationships
    groups_created = relationship("Group", back_populates="admin")
    memberships = relationship("GroupMember", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")


class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    adminId = Column(String, ForeignKey("users.id"))
    playerCount = Column(Integer, default=0)
    inviteCode = Column(String, unique=True, index=True)
    inviteLink = Column(String, nullable=True)
    scoringSystem = Column(String, default="classic")
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="active")

    # Relationships
    admin = relationship("User", back_populates="groups_created")
    members = relationship("GroupMember", back_populates="group")


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userId = Column(String, ForeignKey("users.id"))
    groupId = Column(String, ForeignKey("groups.id"))
    joinedAt = Column(DateTime, default=datetime.datetime.utcnow)
    points = Column(Integer, default=0)
    isAdmin = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="memberships")
    group = relationship("Group", back_populates="members")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    homeTeam = Column(String, nullable=False)
    awayTeam = Column(String, nullable=False)
    homeFlag = Column(String, nullable=True)
    awayFlag = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(String, nullable=True)
    status = Column(String, default="upcoming")
    homeScore = Column(Integer, nullable=True)
    awayScore = Column(Integer, nullable=True)
    
    # New fields
    matchNumber = Column(Integer, nullable=True)
    stage = Column(String, nullable=True)
    group = Column(String, nullable=True)
    stadium = Column(String, nullable=True)
    city = Column(String, nullable=True)

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
    createdAt = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="predictions")
    match = relationship("Match", back_populates="predictions")

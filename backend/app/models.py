from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    sessions = relationship("FocusSession", back_populates="user")

class FocusSession(Base):
    __tablename__ = "focus_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_name = Column(String, nullable=False)
    planned_minutes = Column(Integer, nullable=False)
    actual_minutes = Column(Integer, default=0)
    focus_score = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    start_time = Column(DateTime, default=datetime.now)
    end_time = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="sessions")

class Break(Base):
    __tablename__ = "breaks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    kind = Column(String, nullable=False)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

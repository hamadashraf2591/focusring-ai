from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    created_at: datetime

class SessionCreate(BaseModel):
    task_name: str
    planned_minutes: int

class SessionUpdate(BaseModel):
    actual_minutes: Optional[int] = None
    focus_score: Optional[int] = None
    completed: Optional[bool] = None
    end_time: Optional[datetime] = None

class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    task_name: str
    planned_minutes: int
    actual_minutes: int
    focus_score: int
    completed: bool
    start_time: datetime
    end_time: Optional[datetime]

class BreakCreate(BaseModel):
    kind: str
    duration_seconds: int

class BreakOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    kind: str
    duration_seconds: int
    created_at: datetime

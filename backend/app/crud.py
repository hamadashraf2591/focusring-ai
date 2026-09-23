from sqlalchemy.orm import Session
from . import models, schemas

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def update_user(db: Session, user_id: int, updates: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_session(db: Session, session: schemas.SessionCreate, user_id: int):
    db_session = models.FocusSession(**session.model_dump(), user_id=user_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_user_sessions(db: Session, user_id: int, skip: int = 0, limit: int = 20):
    return db.query(models.FocusSession).filter(models.FocusSession.user_id == user_id).offset(skip).limit(limit).all()

def update_session(db: Session, session_id: int, updates: schemas.SessionUpdate):
    db_session = db.query(models.FocusSession).filter(models.FocusSession.id == session_id).first()
    if not db_session:
        return None
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_session, key, value)
    db.commit()
    db.refresh(db_session)
    return db_session

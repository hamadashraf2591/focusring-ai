from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/users/{user_id}/sessions", tags=["Sessions"])

@router.post("/", response_model=schemas.SessionOut)
def create_session(user_id: int, session: schemas.SessionCreate, db: Session = Depends(database.get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_session(db=db, session=session, user_id=user_id)

@router.get("/", response_model=list[schemas.SessionOut])
def read_sessions(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(database.get_db)):
    return crud.get_user_sessions(db=db, user_id=user_id, skip=skip, limit=limit)

@router.patch("/{session_id}", response_model=schemas.SessionOut)
def update_session(session_id: int, updates: schemas.SessionUpdate, db: Session = Depends(database.get_db)):
    updated = crud.update_session(db=db, session_id=session_id, updates=updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")
    return updated

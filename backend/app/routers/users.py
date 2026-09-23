from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return crud.create_user(db=db, user=user)

@router.get("/{user_id}", response_model=schemas.UserOut)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.patch("/{user_id}", response_model=schemas.UserOut)
def patch_user(user_id: int, updates: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    db_user = crud.update_user(db, user_id=user_id, updates=updates)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

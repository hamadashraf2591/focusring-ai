from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, database

router = APIRouter(prefix="/users/{user_id}/breaks", tags=["Breaks"])

@router.post("/", response_model=schemas.BreakOut)
def log_break(user_id: int, b: schemas.BreakCreate, db: Session = Depends(database.get_db)):
    db_b = models.Break(user_id=user_id, kind=b.kind, duration_seconds=b.duration_seconds)
    db.add(db_b)
    db.commit()
    db.refresh(db_b)
    return db_b

@router.get("/", response_model=list[schemas.BreakOut])
def list_breaks(user_id: int, limit: int = 30, db: Session = Depends(database.get_db)):
    return (
        db.query(models.Break)
        .filter(models.Break.user_id == user_id)
        .order_by(models.Break.id.desc())
        .limit(limit)
        .all()
    )

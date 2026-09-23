from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database
from datetime import datetime, timedelta

router = APIRouter(prefix="/users/{user_id}/analytics", tags=["Analytics"])

@router.get("/")
def get_analytics(user_id: int, db: Session = Depends(database.get_db)):
    sessions = db.query(models.FocusSession).filter(
        models.FocusSession.user_id == user_id
    ).all()

    total_sessions = len(sessions)
    completed = [s for s in sessions if s.completed]
    total_minutes = sum(s.actual_minutes or 0 for s in sessions)
    scored = [s.focus_score for s in sessions if s.focus_score]

    completion_rate = round(len(completed) / total_sessions * 100, 1) if total_sessions else 0
    avg_session = round(total_minutes / total_sessions, 1) if total_sessions else 0
    avg_focus = round(sum(scored) / len(scored), 1) if scored else 0

    now = datetime.utcnow()
    daily = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        mins = sum(
            s.actual_minutes or 0
            for s in sessions
            if s.start_time and day_start <= s.start_time < day_end
        )
        daily.append({"date": day.strftime("%a"), "minutes": mins})

    hour_scores = {}
    for s in sessions:
        if s.focus_score and s.start_time:
            hour_scores.setdefault(s.start_time.hour, []).append(s.focus_score)
    best_hour = None
    best_avg = 0
    for h, scores in hour_scores.items():
        avg = sum(scores) / len(scores)
        if avg > best_avg:
            best_avg = avg
            best_hour = h

    return {
        "total_sessions": total_sessions,
        "completed_sessions": len(completed),
        "total_focus_minutes": total_minutes,
        "avg_session_minutes": avg_session,
        "completion_rate": completion_rate,
        "avg_focus_score": avg_focus,
        "best_focus_hour": best_hour,
        "daily": daily,
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database
from datetime import datetime, timedelta

router = APIRouter(prefix="/users/{user_id}", tags=["Analytics"])


@router.get("/analytics/")
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

    now = datetime.now()
    daily = []
    week_minutes = 0
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        mins = sum(
            s.actual_minutes or 0
            for s in sessions
            if s.start_time and day_start <= s.start_time < day_end
        )
        week_minutes += mins
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

    date_set = sorted({
        s.start_time.date() for s in sessions
        if s.start_time and (s.actual_minutes or 0) > 0
    })
    streak_days = 0
    if date_set:
        cursor = now.date()
        if cursor not in date_set:
            cursor -= timedelta(days=1)
        while cursor in date_set:
            streak_days += 1
            cursor -= timedelta(days=1)

    return {
        "total_sessions": total_sessions,
        "completed_sessions": len(completed),
        "total_focus_minutes": total_minutes,
        "avg_session_minutes": avg_session,
        "completion_rate": completion_rate,
        "avg_focus_score": avg_focus,
        "best_focus_hour": best_hour,
        "streak_days": streak_days,
        "today_minutes": daily[-1]["minutes"] if daily else 0,
        "week_minutes": week_minutes,
        "weekly_goal_minutes": 420,
        "daily": daily,
    }


@router.get("/insights/")
def get_insights(user_id: int, db: Session = Depends(database.get_db)):
    sessions = db.query(models.FocusSession).filter(
        models.FocusSession.user_id == user_id
    ).all()

    insights = []
    if len(sessions) < 3:
        insights.append({
            "kind": "info",
            "text": "Keep logging sessions - personalized insights unlock after a few more.",
        })
        return {"insights": insights, "based_on": len(sessions)}

    now = datetime.now()
    week_ago = now - timedelta(days=7)
    week = [s for s in sessions if s.start_time and s.start_time >= week_ago]
    overall_rate = sum(1 for s in sessions if s.completed) / len(sessions)

    if week:
        week_rate = sum(1 for s in week if s.completed) / len(week)
        if week_rate > overall_rate + 0.05:
            insights.append({
                "kind": "good",
                "text": "Recent form is strong: {}% completion in the last 7 days vs {}% overall.".format(
                    round(week_rate * 100), round(overall_rate * 100)),
            })
        elif week_rate < overall_rate - 0.05:
            insights.append({
                "kind": "warn",
                "text": "Completion dipped to {}% this week (overall {}). Shorter 25-min sessions may help.".format(
                    round(week_rate * 100), round(overall_rate * 100)),
            })

    hour_stats = {}
    for s in sessions:
        if s.completed and s.start_time:
            hour_stats.setdefault(s.start_time.hour, []).append(s.actual_minutes or 0)
    if hour_stats:
        best_hour = max(hour_stats, key=lambda h: sum(hour_stats[h]) / len(hour_stats[h]))
        insights.append({
            "kind": "good",
            "text": "Your strongest study hour is around {}:00 - completed sessions run longest then.".format(best_hour),
        })

    task_stats = {}
    for s in sessions:
        t = task_stats.setdefault(s.task_name, {"n": 0, "c": 0})
        t["n"] += 1
        if s.completed:
            t["c"] += 1
    weak = [(name, v) for name, v in task_stats.items()
            if v["n"] >= 2 and v["c"] / v["n"] < 0.6]
    if weak:
        name, v = min(weak, key=lambda kv: kv[1]["c"] / kv[1]["n"])
        rate = round(v["c"] / v["n"] * 100)
        insights.append({
            "kind": "warn",
            "text": "{} has the highest interruption rate ({}% completion). Schedule it at your best hour.".format(name, rate),
        })
    else:
        insights.append({
            "kind": "good",
            "text": "No weak subjects detected - completion is consistent across your tasks.",
        })

    insights.append({
        "kind": "info",
        "text": "Model checkpoint: predictions are based on {} logged sessions.".format(len(sessions)),
    })

    return {"insights": insights[:4], "based_on": len(sessions)}

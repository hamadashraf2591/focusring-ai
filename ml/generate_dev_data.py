"""Synthetic dataset for ML pipeline development ONLY.
Simulated patterns: evening focus peak, long-session penalty, random fatigue.
Replaced automatically by REAL data once >= 30 sessions exist."""
import csv, random, datetime as dt
from pathlib import Path

random.seed(42)
OUT = Path(__file__).parent / "datasets" / "dev_sessions.csv"
OUT.parent.mkdir(exist_ok=True)

TASKS = ["DSA", "DBMS", "Calculus", "OS", "Networks", "OOP"]
rows = []
now = dt.datetime.now(dt.timezone.utc)

for i in range(300):
    day = now - dt.timedelta(days=random.randint(0, 29))
    hour = random.choices(range(6, 24),
        weights=[2,2,3,4,5,5,6,6,7,8,9,9,8,7,6,5,4,3])[0]
    start = day.replace(hour=hour, minute=random.randint(0, 59),
                        second=0, microsecond=0)
    planned = random.choice([25, 30, 45, 45, 50, 60])
    evening_bonus = 1.18 if 19 <= hour <= 22 else (0.88 if hour < 10 else 1.0)
    long_penalty = 0.78 if planned >= 50 else 1.0
    fatigue = 0.85 if random.random() < 0.25 else 1.0
    ratio = min(1.25, 0.72 * evening_bonus * long_penalty * fatigue
                + random.uniform(-0.12, 0.12))
    actual = max(5, int(planned * ratio))
    completed = int(actual >= 0.8 * planned)
    score = (5 if ratio >= 1 else 4 if ratio >= 0.9 else
             3 if ratio >= 0.75 else 2 if ratio >= 0.6 else 1)
    rows.append({
        "task_name": random.choice(TASKS),
        "planned_minutes": planned,
        "actual_minutes": actual,
        "focus_score": score,
        "completed": completed,
        "start_hour": hour,
        "day_of_week": start.weekday(),
        "start_time": start.isoformat(),
    })

with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)

completed_count = sum(r["completed"] for r in rows)
print(f"Generated {len(rows)} SYNTHETIC sessions -> {OUT}")
print(f"Class balance: {completed_count} completed / {len(rows)-completed_count} not completed")

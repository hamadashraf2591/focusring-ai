"""Export REAL sessions from the FocusRing DB for ML training."""
import sqlite3, csv
from pathlib import Path

DB = Path(__file__).parent.parent / "backend" / "focusring.db"
OUT = Path(__file__).parent / "datasets" / "real_sessions.csv"
OUT.parent.mkdir(exist_ok=True)

conn = sqlite3.connect(DB)
cur = conn.execute(
    "SELECT task_name, planned_minutes, actual_minutes, focus_score, completed, "
    "strftime('%H', start_time), strftime('%w', start_time), start_time "
    "FROM focus_sessions"
)
rows = [{
    "task_name": r[0], "planned_minutes": r[1], "actual_minutes": r[2],
    "focus_score": r[3] or 0, "completed": int(r[4]),
    "start_hour": int(r[5]), "day_of_week": (int(r[6]) - 1) % 7,
    "start_time": r[7],
} for r in cur.fetchall()]
conn.close()

with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)

print(f"Exported {len(rows)} REAL sessions -> {OUT}")

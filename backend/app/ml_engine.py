"""Serves the trained completion model as Focus Risk.
Falls back to Phase 1 rule-based baseline if no model file exists."""
from pathlib import Path
from datetime import datetime
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = ROOT / "ml" / "models" / "completion_model.pkl"
FEATURES = ["planned_minutes", "start_hour", "day_of_week"]

_cache = {"mtime": None, "bundle": None}

def load_model():
    if not MODEL_PATH.exists():
        return None
    mtime = MODEL_PATH.stat().st_mtime
    if _cache["mtime"] != mtime:
        _cache["bundle"] = joblib.load(MODEL_PATH)
        _cache["mtime"] = mtime
    return _cache["bundle"]

def predict_risk(planned_minutes: int):
    now = datetime.now()
    bundle = load_model()

    if bundle is None:
        risk = 0.2
        if planned_minutes >= 50:
            risk += 0.25
        if now.hour >= 23 or now.hour < 6:
            risk += 0.3
        return min(0.95, risk), "rule-based baseline (no trained model found)"

    model = bundle["model"]
    X = pd.DataFrame([{
        "planned_minutes": planned_minutes,
        "start_hour": now.hour,
        "day_of_week": now.weekday(),
    }])
    p_complete = model.predict_proba(X[FEATURES])[0][1]
    return 1 - p_complete, "trained model (logistic regression)"

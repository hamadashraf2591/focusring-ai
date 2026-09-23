from fastapi import APIRouter
from ..ml_engine import predict_risk

router = APIRouter(prefix="/users/{user_id}/predict", tags=["Prediction"])

@router.get("/")
def predict(user_id: int, planned_minutes: int = 45):
    risk, source = predict_risk(planned_minutes)
    percent = round(risk * 100)
    if percent < 40:
        level = "low"
        rec = "Great window for a full session. Start now!"
    elif percent < 65:
        level = "moderate"
        rec = "Plan a 5-minute break midway through this session."
    else:
        level = "high"
        rec = "High distraction risk. Prefer a shorter 25-min session or take a 10-min break first."
    return {
        "focus_risk_percent": percent,
        "level": level,
        "recommendation": rec,
        "model_source": source,
    }

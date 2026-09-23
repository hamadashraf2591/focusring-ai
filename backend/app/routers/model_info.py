from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/info")
def model_info():
    metrics_path = Path(__file__).resolve().parents[3] / "ml" / "metrics.json"
    data = {
        "algorithm": "Logistic Regression",
        "features": ["planned_minutes", "start_hour", "day_of_week"],
        "source": None,
        "accuracy": None,
        "roc_auc": None,
        "n_sessions": None,
    }
    if metrics_path.exists():
        try:
            raw = json.loads(metrics_path.read_text())
            for k in ("source", "accuracy", "roc_auc", "n_sessions"):
                data[k] = raw.get(k)
        except Exception:
            pass
    return data

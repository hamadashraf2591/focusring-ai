"""Phase 2 model: predict session completion.
Focus Risk = 1 - P(complete). Trains on REAL data (>=30 sessions),
else SYNTHETIC dev data (clearly flagged, pipeline testing only)."""
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score

HERE = Path(__file__).parent
real = HERE / "datasets" / "real_sessions.csv"
dev = HERE / "datasets" / "dev_sessions.csv"

if real.exists() and sum(1 for _ in open(real)) - 1 >= 30:
    df = pd.read_csv(real)
    source = "REAL user data"
else:
    df = pd.read_csv(dev)
    source = "SYNTHETIC dev data (pipeline testing only)"
print(f"Training on {len(df)} sessions | source: {source}")

features = ["planned_minutes", "start_hour", "day_of_week"]
X, y = df[features], df["completed"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2,
                                      random_state=42, stratify=y)

model = LogisticRegression(max_iter=1000)
model.fit(Xtr, ytr)
proba = model.predict_proba(Xte)[:, 1]
metrics = {
    "source": source,
    "n_sessions": len(df),
    "accuracy": round(accuracy_score(yte, model.predict(Xte)), 3),
    "roc_auc": round(roc_auc_score(yte, proba), 3),
}
print("Metrics:", metrics)

(HERE / "models").mkdir(exist_ok=True)
joblib.dump({"model": model, "features": features},
            HERE / "models" / "completion_model.pkl")
pd.Series(metrics).to_json(HERE / "metrics.json")

demo = pd.DataFrame([{"planned_minutes": 60, "start_hour": 23, "day_of_week": 2}])
risk = 1 - model.predict_proba(demo)[0][1]
print(f"Demo -> 60-min session at 11 PM: Focus Risk = {risk:.0%}")

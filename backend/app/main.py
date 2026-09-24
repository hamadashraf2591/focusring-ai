import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from . import models
from .routers import users, sessions, analytics, predict, breaks, model_info

app = FastAPI(title="FocusRing AI API", version="0.9.0")

_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins.split(","),
    allow_origin_regex=r"https://.*\.(hf\.space|vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            db.add(models.User(name="Muhammad Hamad Ashraf", email="hammad@focusring.ai"))
            db.commit()
    finally:
        db.close()

app.include_router(users.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(breaks.router, prefix="/api")
app.include_router(model_info.router, prefix="/api")

@app.get("/")
def root():
    return {"project": "FocusRing AI", "status": "healthy", "docs": "/docs"}

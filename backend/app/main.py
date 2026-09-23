from fastapi import FastAPI
from .database import engine, Base
from .routers import users, sessions

app = FastAPI(title="FocusRing AI API", version="0.2.0")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(users.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")

@app.get("/")
def root():
    return {"project": "FocusRing AI", "status": "healthy", "docs": "/docs"}

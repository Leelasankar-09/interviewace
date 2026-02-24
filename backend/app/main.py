from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

from app.core.config import settings
from app.middleware.logic import LoggingMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.core import exceptions
from app.routes import (
    auth, dsa, behavioral, systemdesign, mock, resume,
    community, profile, voice, questions, leaderboard, badges,
    sessions, analytics, dashboard, evaluate, prep, tracker, extension
)

# ── Logging Setup ──────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("interviewace")

app = FastAPI(
    title="InterviewAce API",
    version="3.0.0",
    description="Clean MVC Architecture — PostgreSQL + Redis + Claude-Opus",
)

# ── Middlewares ────────────────────────────────────────────────
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, limit=100, window=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174",
                   "https://interviewace.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Error Handling ─────────────────────────────────────
exceptions.setup_exception_handlers(app)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ── Startup: create DB tables ──────────────────────────────────
@app.on_event("startup")
def startup():
    from app.core.database import init_db
    init_db()
    # Ensure recordings directory exists one level up from app/
    Path("recordings").mkdir(exist_ok=True)

# ── Static files for saved recordings ─────────────────────────
recordings_path = Path("recordings")
recordings_path.mkdir(exist_ok=True)
app.mount("/recordings", StaticFiles(directory="recordings"), name="recordings")

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(dsa.router, prefix="/api")
app.include_router(behavioral.router, prefix="/api")
app.include_router(systemdesign.router, prefix="/api")
app.include_router(mock.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(badges.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(evaluate.router, prefix="/api")
app.include_router(prep.router, prefix="/api")
app.include_router(tracker.router, prefix="/api")
app.include_router(extension.router, prefix="/api")

# ── Health check ───────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0", "architecture": "MVC"}

@app.get("/")
def root():
    return {"message": "InterviewAce API v3 (MVC) — /docs for Swagger UI"}

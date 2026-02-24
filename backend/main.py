from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

from config import settings
from middleware.logic import LoggingMiddleware
from routers import (
    auth, dsa, behavioral, systemdesign, mock, resume,
    community, profile, voice, questions, leaderboard, badges,
    sessions as sessions_router, analytics as analytics_router,
    dashboard, evaluate, prep
)

# ── Logging Setup ──────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("interviewace")

app = FastAPI(
    title="InterviewAce API",
    version="2.1.0",
    description="AI Interview Coach — PostgreSQL + Redis + Claude-Opus",
)

# ── Middlewares ────────────────────────────────────────────────
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174",
                   "https://interviewace.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Error Handling ─────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else None
        }
    )

# ── Startup: create DB tables ──────────────────────────────────
@app.on_event("startup")
def startup():
    from database import init_db
    init_db()
    # Ensure recordings directory exists
    Path("recordings").mkdir(exist_ok=True)

# ── Static files for saved recordings ─────────────────────────
recordings_path = Path("recordings")
recordings_path.mkdir(exist_ok=True)
app.mount("/recordings", StaticFiles(directory="recordings"), name="recordings")

# ── Routers ───────────────────────────────────────────────────
for router in [auth, dsa, behavioral, systemdesign, mock, resume,
               community, profile, voice, questions, leaderboard, badges,
               sessions_router, analytics_router, dashboard, evaluate, prep]:
    app.include_router(router.router, prefix="/api")


# ── Health check ───────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
def root():
    return {"message": "InterviewAce API v2 — /docs for Swagger UI"}

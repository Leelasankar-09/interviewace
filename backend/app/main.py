# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.logging import logger
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.error_handler import setup_exception_handlers
from app.routes import auth

app = FastAPI(
    title="InterviewAce API",
    version="3.0.0",
    description="Strict MVC Architecture - Sprint 1 Foundation",
)

# ── Middlewares (Applied in order) ──────────────────────────────
# 1. Error Handler (Outer for catching middleware errors)
setup_exception_handlers(app)

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Logging
app.add_middleware(LoggingMiddleware)

# 4. Auth (JWT Validation)
app.add_middleware(AuthMiddleware)

# 5. Rate Limiting (Redis-based)
app.add_middleware(RateLimitMiddleware, limit=100, window=60)

# ── Startup/Shutdown ───────────────────────────────────────────
@app.on_event("startup")
def startup():
    logger.info("Starting InterviewAce API — Take 2")
    from app.core.database import init_db
    init_db()
    Path("recordings").mkdir(exist_ok=True)

# ── Static Files ───────────────────────────────────────────────
app.mount("/recordings", StaticFiles(directory="recordings"), name="recordings")

from app.routes import auth, dashboard, profile, evaluation, resume, dsa, community, tracker, mock, study_plan, prep, systemdesign

app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(dsa.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(tracker.router, prefix="/api")
app.include_router(mock.router, prefix="/api")
app.include_router(study_plan.router, prefix="/api")
app.include_router(prep.router, prefix="/api")
app.include_router(systemdesign.router, prefix="/api")

# ── Health & Root ──────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok", 
        "version": "3.0.0", 
        "env": settings.APP_ENV,
        "architecture": "Strict MVC"
    }

@app.get("/")
def root():
    return {"message": "Welcome to InterviewAce API Take 2 — /docs for Swagger UI"}

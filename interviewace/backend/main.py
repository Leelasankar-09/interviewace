from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from routers import (
    auth, dsa, behavioral, systemdesign, mock, resume,
    community, profile, voice, questions, leaderboard,
    sessions as sessions_router, analytics as analytics_router
)

app = FastAPI(
    title="InterviewAce API",
    version="2.0.0",
    description="AI Interview Coach — voice eval, session history, NLP analysis",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174",
                   "https://interviewace.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
               community, profile, voice, questions, leaderboard,
               sessions_router, analytics_router]:
    app.include_router(router.router, prefix="/api")


# ── Health check ───────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
def root():
    return {"message": "InterviewAce API v2 — /docs for Swagger UI"}

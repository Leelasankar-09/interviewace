from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, dsa, behavioral, systemdesign, mock, resume, community, profile, voice, questions

app = FastAPI(title="InterviewAce API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://interviewace.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
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


@app.get("/")
def root():
    return {"message": "InterviewAce API is running 🚀", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # ── Database & Cache ──────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./interviewace.db"
    REDIS_URL: str    = "redis://localhost:6379/0"
    
    # ── Auth (Strict 15m / 7d) ─────────────────────────────────────
    JWT_SECRET: str   = "dev-secret-change-in-prod-12345678"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ── AI Services ───────────────────────────────────────────────
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # ── External Integrations ──────────────────────────────────────
    CLOUDINARY_URL: Optional[str] = None
    
    # ── Email Settings (SMTP) ──────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    MAIL_FROM: str = "no-reply@interviewace.ai"
    
    # ── Monitoring & App ───────────────────────────────────────────
    SENTRY_DSN: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    DEBUG: bool = True
    APP_ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

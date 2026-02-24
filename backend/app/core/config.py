from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./interviewace.db"
    REDIS_URL: str    = "redis://localhost:6379/0"
    
    # ── Auth ───────────────────────────────────────────────────────
    JWT_SECRET: str   = "dev-secret-change-in-prod-12345678"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 30
    
    # ── AI / External ─────────────────────────────────────────────
    ANTHROPIC_API_KEY: Optional[str] = None
    HF_API_KEY: Optional[str] = None
    
    # ── Storage ───────────────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # ── App ────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"
    PORT: int = 8000
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import redis
import logging
from .config import settings

DATABASE_URL = settings.DATABASE_URL
REDIS_URL    = settings.REDIS_URL

# Default logger for database module
logger = logging.getLogger(__name__)

# Database Engine
engine_args = {
    "poolclass": QueuePool,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_pre_ping": True,
}

if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.pool import StaticPool
    engine_args = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool
    }

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Redis Client with Graceful Fallback
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
except Exception:
    logger.warning("Redis connection failed. Using MockRedis fallback.")
    class MockRedis:
        def get(self, *args, **kwargs): return None
        def set(self, *args, **kwargs): return True
        def delete(self, *args, **kwargs): return True
        def exists(self, *args, **kwargs): return False
        def pipeline(self): return self
        def incr(self, *args, **kwargs): return 1
        def expire(self, *args, **kwargs): return True
        def execute(self): return []
    redis_client = MockRedis()

def init_db():
    from app.models import Base  # noqa: F401
    Base.metadata.create_all(bind=engine)

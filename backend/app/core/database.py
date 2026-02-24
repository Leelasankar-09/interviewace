from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool
import redis
from .config import settings

DATABASE_URL = settings.DATABASE_URL
REDIS_URL    = settings.REDIS_URL

# Database Engine
# pool_size and max_overflow are important for PostgreSQL concurrency
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
    # Optional: Quick check to see if it's alive
    # redis_client.ping() 
except Exception:
    import logging
    logging.getLogger(__name__).warning("Redis connection failed. Using MockRedis fallback.")
    class MockRedis:
        def get(self, *args, **kwargs): return None
        def set(self, *args, **kwargs): return True
        def delete(self, *args, **kwargs): return True
        def exists(self, *args, **kwargs): return False
        def keys(self, *args, **kwargs): return []
        def flushdb(self, *args, **kwargs): return True
    redis_client = MockRedis()

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis():
    return redis_client

def init_db():
    from app.models import user_model, session_model, analytics_model  # noqa: F401
    Base.metadata.create_all(bind=engine)

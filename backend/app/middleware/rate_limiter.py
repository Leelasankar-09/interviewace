# app/middleware/rate_limiter.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import get_redis
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        super().__init__(app)
        self.limit = limit    # Max requests
        self.window = window  # Window in seconds
        self.redis = get_redis()

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api"):
            client_ip = request.client.host if request.client else "unknown"
            key = f"ratelimit:{client_ip}"
            
            try:
                current = self.redis.get(key)
                if current and int(current) >= self.limit:
                    raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
                
                # Increment and set TTL if new
                pipe = self.redis.pipeline()
                pipe.incr(key)
                pipe.expire(key, self.window)
                pipe.execute()
            except HTTPException as e:
                raise e
            except Exception:
                # If Redis is down, we allow the request (graceful failure)
                pass

        return await call_next(request)

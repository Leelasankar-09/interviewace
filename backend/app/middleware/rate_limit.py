# app/middleware/rate_limit.py
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import redis_client
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window

    async def dispatch(self, request: Request, call_next):
        # We can implement more granular limits in controllers, 
        # but this provides a global per-IP baseline.
        client_ip = request.client.host
        path = request.url.path
        
        # Basic bucket logic
        key = f"rate_limit:{client_ip}:{path}"
        
        try:
            current = redis_client.get(key)
            if current and int(current) >= self.limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down."
                )
            
            p = redis_client.pipeline()
            p.incr(key)
            # Set expiry only if it's a new key
            if not current:
                p.expire(key, self.window)
            p.execute()
            
        except HTTPException as e:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=e.status_code,
                content={"success": False, "error": e.detail}
            )
        except Exception:
            # If Redis is down, we allow the request but log it
            pass
            
        return await call_next(request)

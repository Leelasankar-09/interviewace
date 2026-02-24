from fastapi import Request, HTTPException, Depends
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

from routers.auth import get_current_user
from models.user_model import User

logger = logging.getLogger("interviewace")

# ── Role-Based Access Control ───────────────────────────────────
class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            logger.warning(f"Unauthorized access attempt by {user.email} (Role: {user.role})")
            raise HTTPException(
                status_code=403, 
                detail=f"Resource requires roles: {self.allowed_roles}"
            )
        return user

# ── Structured Logging Middleware ────────────────────────────────
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}ms".format(process_time)
        
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Took: {formatted_process_time}"
        )
        
        return response

# ── Helpers for common roles ────────────────────────────────────
admin_only = RoleChecker(["admin"])
premium_only = RoleChecker(["admin", "premium"])

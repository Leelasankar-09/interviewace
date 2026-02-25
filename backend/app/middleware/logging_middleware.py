# app/middleware/logging_middleware.py
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Access user id if available in state from auth middleware
        user_id = getattr(request.state, "user_id", "anonymous")
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        formatted_process_time = "{0:.2f}ms".format(process_time)
        
        logger.info(
            f"RID: {user_id} | {request.method} {request.url.path} | "
            f"Status: {response.status_code} | Time: {formatted_process_time}"
        )
        
        return response

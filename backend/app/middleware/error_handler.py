# app/middleware/error_handler.py
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from app.core.logging import logger
from app.core.config import settings

async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        if isinstance(exc, HTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "error": exc.detail,
                    "status_code": exc.status_code
                }
            )
        
        # Generic Internal Server Error
        logger.error(f"Global Error: {str(exc)}", exc_info=True)
        
        detail = str(exc) if settings.DEBUG else "Internal Server Error"
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "Internal Server Error",
                "detail": detail
            }
        )

def setup_exception_handlers(app):
    # This can also be used via app.add_exception_handler(Exception, ...)
    # but the middleware approach catches more low-level issues.
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return await error_handler_middleware(request, lambda r: None) # Mock next

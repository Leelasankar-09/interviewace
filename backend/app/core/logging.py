# app/core/logging.py
import logging
from logging.handlers import RotatingFileHandler
import os
from .config import settings

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("interviewace")
logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# File Handler (10MB max, 5 backups)
file_handler = RotatingFileHandler(
    "logs/app.log", maxBytes=10*1024*1024, backupCount=5
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# Stream Handler (Console)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# gunicorn.conf.py
import multiprocessing
import os

# Port is typically provided by Render as an environment variable
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Worker configuration
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

# Timeout and Logging
timeout = 120
keepalive = 5
accesslog = "-"
errorlog = "-"
loglevel = "info"

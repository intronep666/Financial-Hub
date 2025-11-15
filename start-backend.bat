@echo off
cd /d "%~dp0backend"
REM Development environment variables
set USE_SQLITE=true
set DEBUG=true
set COOKIE_SECURE=false
set SKIP_DB_INIT=false
set REDIS_URL=redis://localhost:6379/0
set CELERY_BROKER_URL=%REDIS_URL%
set CELERY_RESULT_BACKEND=redis://localhost:6379/1
set AI_SERVICE_URL=http://localhost:8001
set SENTRY_DSN=
echo Starting Backend Server (running uvicorn in active venv)...
REM Uses repo-level venv; if you have a different venv, adjust the path.
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

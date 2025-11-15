@echo off
cd /d "%~dp0backend"
REM Development environment variables
IF NOT DEFINED USE_SQLITE set USE_SQLITE=true
IF NOT DEFINED DEBUG set DEBUG=true
IF NOT DEFINED COOKIE_SECURE set COOKIE_SECURE=false
REM Default to skipping DB init for faster dev imports; set SKIP_DB_INIT=false to run migrations on start
IF NOT DEFINED SKIP_DB_INIT set SKIP_DB_INIT=true
IF NOT DEFINED REDIS_URL set REDIS_URL=redis://localhost:6379/0
IF NOT DEFINED CELERY_BROKER_URL set CELERY_BROKER_URL=%REDIS_URL%
IF NOT DEFINED CELERY_RESULT_BACKEND set CELERY_RESULT_BACKEND=redis://localhost:6379/1
set AI_SERVICE_URL=http://localhost:8001
set SENTRY_DSN=
echo Starting Backend Server (running uvicorn in active venv)...
REM Uses repo-level venv; if you have a different venv, adjust the path.
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

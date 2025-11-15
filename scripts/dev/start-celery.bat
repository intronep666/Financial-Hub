@echo off
cd /d "%~dp0backend"
REM Ensure environment matches dev local setup (but respect existing env overrides)
IF NOT DEFINED USE_SQLITE set USE_SQLITE=true
IF NOT DEFINED SKIP_DB_INIT set SKIP_DB_INIT=true
IF NOT DEFINED REDIS_URL set REDIS_URL=redis://localhost:6379/0
IF NOT DEFINED CELERY_BROKER_URL set CELERY_BROKER_URL=%REDIS_URL%
IF NOT DEFINED CELERY_RESULT_BACKEND set CELERY_RESULT_BACKEND=redis://localhost:6379/1
echo Starting Celery worker...
..\.venv\Scripts\python.exe -m celery -A celery_app.celery_app worker --loglevel=info
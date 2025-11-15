@echo off
cd /d "%~dp0backend"
REM Ensure environment matches dev local setup
set USE_SQLITE=true
set SKIP_DB_INIT=true
set REDIS_URL=redis://localhost:6379/0
set CELERY_BROKER_URL=%REDIS_URL%
set CELERY_RESULT_BACKEND=redis://localhost:6379/1
echo Starting Celery worker...
..\.venv\Scripts\python.exe -m celery -A celery_app.celery_app worker --loglevel=info
#!/usr/bin/env bash
# Start the backend dev server using the repo venv and useful dev defaults
set -euo pipefail
cd "$(dirname "$0")/backend"
# Development environment variables
export USE_SQLITE=true
export DEBUG=true
export COOKIE_SECURE=false
# Default to skipping DB init for faster dev imports; set SKIP_DB_INIT=false to run migrations on start
export SKIP_DB_INIT=true
export REDIS_URL=redis://localhost:6379/0
export CELERY_BROKER_URL=${REDIS_URL}
export CELERY_RESULT_BACKEND=redis://localhost:6379/1
export AI_SERVICE_URL=http://localhost:8001
export SENTRY_DSN=""
echo "Starting Backend Server (running uvicorn) with env: SKIP_DB_INIT=${SKIP_DB_INIT}..."
if [[ -f ../.venv/bin/python ]]; then
  ../.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
fi

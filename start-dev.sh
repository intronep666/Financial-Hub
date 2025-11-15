#!/usr/bin/env bash
# Start the backend dev server using the repo venv and useful dev defaults
set -euo pipefail
cd "$(dirname "$0")/backend"
# Development environment variables
export USE_SQLITE=${USE_SQLITE:-true}
export DEBUG=${DEBUG:-true}
export COOKIE_SECURE=${COOKIE_SECURE:-false}
export SKIP_DB_INIT=${SKIP_DB_INIT:-true}
export REDIS_URL=${REDIS_URL:-redis://localhost:6379/0}
export CELERY_BROKER_URL=${CELERY_BROKER_URL:-${REDIS_URL}}
export CELERY_RESULT_BACKEND=${CELERY_RESULT_BACKEND:-redis://localhost:6379/1}
export AI_SERVICE_URL=${AI_SERVICE_URL:-http://localhost:8001}
export SENTRY_DSN=${SENTRY_DSN:-""}
echo "Starting Backend Server (running uvicorn) with env: SKIP_DB_INIT=${SKIP_DB_INIT}..."
if [[ -f ../.venv/bin/python ]]; then
  ../.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
else
  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
fi

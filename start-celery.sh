#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/backend"
export REDIS_URL=redis://localhost:6379/0
export CELERY_BROKER_URL=${REDIS_URL}
export CELERY_RESULT_BACKEND=redis://localhost:6379/1
echo "Starting Celery worker (backend/celery_app.py) with broker ${CELERY_BROKER_URL}"
if [[ -f ../.venv/bin/python ]]; then
  ../.venv/bin/python -m celery -A celery_app.celery_app worker --loglevel=info
else
  python -m celery -A celery_app.celery_app worker --loglevel=info
fi

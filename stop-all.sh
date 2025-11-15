#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PIDS_FILE="$PWD/dev-pids.txt"
if [[ ! -f "$PIDS_FILE" ]]; then
  echo "No PID file found ($PIDS_FILE). Nothing to stop."
  exit 0
fi

read -r PID_BACKEND PID_CELERY PID_FRONTEND < "$PIDS_FILE"

echo "Stopping backend (PID: $PID_BACKEND)..." || true
if [[ -n "$PID_BACKEND" ]]; then
  kill "$PID_BACKEND" 2>/dev/null || true
fi

echo "Stopping celery (PID: $PID_CELERY)..." || true
if [[ -n "$PID_CELERY" ]]; then
  kill "$PID_CELERY" 2>/dev/null || true
fi

echo "Stopping frontend (PID: $PID_FRONTEND)..." || true
if [[ -n "$PID_FRONTEND" ]]; then
  kill "$PID_FRONTEND" 2>/dev/null || true
fi

rm -f "$PIDS_FILE"
echo "All processes stopped and PID file removed."

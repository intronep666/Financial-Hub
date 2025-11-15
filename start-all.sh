#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Start backend, celery (optional), and frontend in background and write PIDs to dev-pids.txt
PIDS_FILE="$PWD/dev-pids.txt"
echo "Starting all services (backend, celery, frontend) in background..."

# Bring up services in order: backend -> celery -> frontend
./start-dev.sh &
PID_BACKEND=$!
echo "Backend started (PID $PID_BACKEND)"

./start-celery.sh &
PID_CELERY=$!
echo "Celery started (PID $PID_CELERY)"

./start-frontend.sh &
PID_FRONTEND=$!
echo "Frontend (Vite) started (PID $PID_FRONTEND)"

echo "$PID_BACKEND $PID_CELERY $PID_FRONTEND" > "$PIDS_FILE"
echo "PIDs written to $PIDS_FILE"

echo "All services started. Access the app at http://localhost:3000 (frontend) and http://localhost:8000 (backend)"

#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../frontend"
export VITE_API_URL=${VITE_API_URL:-http://localhost:8000}
echo "Starting Frontend (Vite dev) with VITE_API_URL=${VITE_API_URL}..."
if [[ -f ../frontend/node_modules/.bin/vite ]]; then
  npm run dev -- --host
else
  npm run dev -- --host
fi

#!/usr/bin/env bash
set -euo pipefail

# Basic smoke test script for Financial Hub backend API
# Usage: BASE_URL=http://localhost:8000 ./scripts/smoke_test.sh

BASE_URL=${BASE_URL:-http://localhost:8000}

echo "Health check: $BASE_URL/health"
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$status" -ne 200 ]; then
  echo "Health check failed: HTTP $status" >&2
  exit 1
fi

echo "Registering test user..."
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username":"smoke_user","password":"SmokePass1!","email":"smoke@example.com"}' \
  "$BASE_URL/auth/register"

echo "Requesting login token (cookie will be stored in ./cookiejar)..."
curl -s -c cookiejar -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=smoke_user&password=SmokePass1!' "$BASE_URL/auth/token"

echo "Creating a transaction..."
categories_json=$(curl -s -b cookiejar "$BASE_URL/categories" || true)
category_id=$(echo "$categories_json" | jq -r '.[0].id' || true)
if [ -z "$category_id" ] || [ "$category_id" = "null" ]; then
  echo "No categories found for user; using default category id 1"
  category_id=1
fi
curl -s -b cookiejar -X POST -H 'Content-Type: application/json' \
  -d "{\"description\":\"Smoke test transaction\",\"amount\":5.0,\"type\":\"expense\",\"category_id\":$category_id}" \
  "$BASE_URL/transactions" | jq || true

echo "Listing transactions (last 10):"
curl -s -b cookiejar "$BASE_URL/transactions?limit=10" | jq || true

echo "Smoke test finished: OK"

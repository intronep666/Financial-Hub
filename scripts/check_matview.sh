#!/usr/bin/env bash
set -euo pipefail

# Checks whether the Postgres materialized view and index exist
echo "Checking materialized view 'user_financial_summary_mv' in Postgres..."

DB_NAME=${DB_NAME:-financial_hub}
POSTGRES_USER=${POSTGRES_USER:-postgres}

echo "Querying matview..."
docker compose exec -T postgres psql -U ${POSTGRES_USER} -d ${DB_NAME} -c "SELECT matviewname FROM pg_matviews WHERE matviewname = 'user_financial_summary_mv';"

echo "Querying indexes on matview..."
docker compose exec -T postgres psql -U ${POSTGRES_USER} -d ${DB_NAME} -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'user_financial_summary_mv';"

echo "Triggering a view refresh via backend's refresh endpoint (inside the backend container)"
docker compose exec -T backend python -c "from services.summary_refresh import refresh_financial_summary_view; refresh_financial_summary_view(); print('REFRESH_OK')"

echo "Matview checks completed."

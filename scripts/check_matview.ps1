param(
    [string]$DbName = 'financial_hub',
    [string]$PostgresUser = 'postgres'
)

Write-Host "Checking materialized view 'user_financial_summary_mv' in Postgres..."

Write-Host "Querying matview..."
docker compose exec -T postgres psql -U $PostgresUser -d $DbName -c "SELECT matviewname FROM pg_matviews WHERE matviewname = 'user_financial_summary_mv';"

Write-Host "Querying indexes on matview..."
docker compose exec -T postgres psql -U $PostgresUser -d $DbName -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'user_financial_summary_mv';"

Write-Host "Triggering a view refresh via backend's refresh endpoint (inside the backend container)"
docker compose exec -T backend python -c "from services.summary_refresh import refresh_financial_summary_view; refresh_financial_summary_view(); print('REFRESH_OK')"

Write-Host "Matview checks completed."

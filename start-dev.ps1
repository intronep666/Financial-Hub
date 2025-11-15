Param()
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot\backend
# Development environment variables
$env:USE_SQLITE = 'true'
$env:DEBUG = 'true'
$env:COOKIE_SECURE = 'false'
# Default to skipping DB init for faster dev imports; set SKIP_DB_INIT=false to run migrations on start
$env:SKIP_DB_INIT = 'true'
$env:REDIS_URL = 'redis://localhost:6379/0'
$env:CELERY_BROKER_URL = $env:REDIS_URL
$env:CELERY_RESULT_BACKEND = 'redis://localhost:6379/1'
$env:AI_SERVICE_URL = 'http://localhost:8001'
$env:SENTRY_DSN = ''
Write-Host "Starting Backend Server (uvicorn) with SKIP_DB_INIT=$($env:SKIP_DB_INIT)..."
if (Test-Path "..\.venv\Scripts\python.exe") {
    & ..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} else {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}
Pop-Location

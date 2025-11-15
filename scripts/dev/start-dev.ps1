Param()
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot\..\..\backend
# Development environment variables
$env:USE_SQLITE = $env:USE_SQLITE -or 'true'
$env:DEBUG = $env:DEBUG -or 'true'
$env:COOKIE_SECURE = $env:COOKIE_SECURE -or 'false'
#$env:SKIP_DB_INIT - default to true (only set if not already set)
if (-not $env:SKIP_DB_INIT) { $env:SKIP_DB_INIT = 'true' }
if (-not $env:REDIS_URL) { $env:REDIS_URL = 'redis://localhost:6379/0' }
if (-not $env:CELERY_BROKER_URL) { $env:CELERY_BROKER_URL = $env:REDIS_URL }
if (-not $env:CELERY_RESULT_BACKEND) { $env:CELERY_RESULT_BACKEND = 'redis://localhost:6379/1' }
if (-not $env:AI_SERVICE_URL) { $env:AI_SERVICE_URL = 'http://localhost:8001' }
if (-not $env:SENTRY_DSN) { $env:SENTRY_DSN = '' }
Write-Host "Starting Backend Server (uvicorn) with SKIP_DB_INIT=$($env:SKIP_DB_INIT)..."
if (Test-Path "..\.venv\Scripts\python.exe") {
    & ..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} else {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}
Pop-Location

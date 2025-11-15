Param()
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot\..\..\backend
# Development environment variables for Celery
$env:MAKE_CELERY_HAPPY = $env:MAKE_CELERY_HAPPY -or 'true'
$env:REDIS_URL = $env:REDIS_URL -or 'redis://localhost:6379/0'
$env:CELERY_BROKER_URL = $env:CELERY_BROKER_URL -or $env:REDIS_URL
$env:CELERY_RESULT_BACKEND = $env:CELERY_RESULT_BACKEND -or 'redis://localhost:6379/1'
Write-Host "Starting Celery worker (broker=$env:CELERY_BROKER_URL)..."
celery -A celery_app.celery_app worker --loglevel=info
Pop-Location
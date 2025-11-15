@echo off
REM Start Celery worker
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\dev\start-celery.ps1"
pause
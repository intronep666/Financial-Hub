@echo off
REM Financial Hub Development Launcher (Windows)
REM Simple launcher for development scripts

set SCRIPT_DIR=%~dp0scripts\dev

if "%1"=="start" goto start
if "%1"=="backend" goto backend
if "%1"=="frontend" goto frontend
if "%1"=="stop" goto stop
goto help

:start
echo 🚀 Starting all Financial Hub services...
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\start-all.ps1"
goto end

:backend
echo 🚀 Starting backend API server...
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\start-backend.ps1"
goto end

:frontend
echo 🚀 Starting frontend development server...
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\start-frontend.ps1"
goto end

:stop
echo 🛑 Stopping all services...
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%\stop-all.ps1"
goto end

:help
echo Financial Hub Development Launcher (Windows)
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   start       Start all services (backend + frontend + celery)
echo   backend     Start backend API server only
echo   frontend    Start frontend development server only
echo   stop        Stop all services
echo   help        Show this help message
echo.
echo Services will be available at:
echo   Backend API: http://localhost:8000
echo   Frontend:    http://localhost:3000 or http://localhost:5173
echo   API Docs:    http://localhost:8000/docs

:end
@echo off
cd /d "%~dp0frontend"
echo Starting Frontend (Vite dev)...
REM Default Vite API url for local dev if .env is not present
set VITE_API_URL=http://localhost:8000
REM Use `npm run dev -- --host` to host on all interfaces when useful
call npm run dev -- --host

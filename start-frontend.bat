@echo off
cd /d "%~dp0frontend"
echo Starting Frontend (Vite dev)...
REM Use `npm run dev -- --host` to host on all interfaces when useful
call npm run dev -- --host

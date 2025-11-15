@echo off@echo off

REM Stop all Financial Hub services started via dev scriptsecho Stopping all Financial Hub services...

powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\dev\stop-all.ps1"taskkill /FI "WINDOWTITLE eq Financial Hub - Backend*" /T /F 2>nul

pausetaskkill /FI "WINDOWTITLE eq Financial Hub - Celery*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Financial Hub - Frontend*" /T /F 2>nul
echo Done!
pause

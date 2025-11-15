@echo off
echo Stopping all Financial Hub services...
taskkill /FI "WINDOWTITLE eq Financial Hub - Backend*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Financial Hub - Celery*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Financial Hub - Frontend*" /T /F 2>nul
echo Done!
pause

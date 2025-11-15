@echo off
echo ========================================
echo   Financial Hub - Starting All Services
echo ========================================
echo.
echo [1/2] Launching Backend Server...
echo [1/3] Launching Backend Server...
start "Financial Hub - Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
echo [2/3] Launching Celery worker (optional)...
start "Financial Hub - Celery" cmd /k "%~dp0start-celery.bat"
timeout /t 3 /nobreak >nul
echo [3/3] Launching Frontend...
start "Financial Hub - Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo   Backend: http://localhost:8000
echo   Frontend (Vite): http://localhost:3000
echo ========================================
echo.
pause

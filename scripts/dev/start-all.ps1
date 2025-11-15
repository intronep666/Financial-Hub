Param()
Set-StrictMode -Version Latest
$scriptDir = $PSScriptRoot
Write-Host "Starting Backend..."
Start-Process -FilePath powershell.exe -ArgumentList "-WindowStyle", "Normal", "-File", "$scriptDir\start-dev.ps1"
Start-Sleep -Seconds 3
Write-Host "Starting Frontend..."
Start-Process -FilePath powershell.exe -ArgumentList "-WindowStyle", "Normal", "-File", "$scriptDir\start-frontend.ps1"
Start-Sleep -Seconds 2
Write-Host "Starting Celery (optional)..."
# Note: Celery start script not available for PowerShell - start manually if needed
Write-Host "All services started!"
Write-Host "- Backend API: http://localhost:8000"
Write-Host "- Frontend: http://localhost:3000 or http://localhost:5173"
Write-Host "- API Docs: http://localhost:8000/docs"

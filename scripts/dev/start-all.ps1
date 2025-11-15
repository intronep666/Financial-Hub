Param()
Set-StrictMode -Version Latest
$scriptDir = $PSScriptRoot
Write-Host "Starting Backend..."
Start-Process -FilePath powershell.exe -ArgumentList "-WindowStyle", "Normal", "-File", "$scriptDir\start-backend.ps1"
Start-Sleep -Seconds 3
Write-Host "Starting Frontend..."
Start-Process -FilePath powershell.exe -ArgumentList "-WindowStyle", "Normal", "-File", "$scriptDir\start-frontend.ps1"
Start-Sleep -Seconds 2
Write-Host "Starting Celery (optional)..."
Start-Process -FilePath powershell.exe -ArgumentList "-WindowStyle", "Normal", "-File", "$scriptDir\start-celery.ps1"
Write-Host "All services started!"
Write-Host "- Backend API: http://localhost:8000"
Write-Host "- Frontend: http://localhost:3000 or http://localhost:5173"
Write-Host "- API Docs: http://localhost:8000/docs"

Param()
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
$scriptDir = $PSScriptRoot
Write-Host "Starting Backend..."
Start-Process -FilePath cmd.exe -ArgumentList "/c start \"Financial Hub - Backend\" cmd /k \"$scriptDir\start-backend.bat\""
Start-Sleep -Seconds 2
Write-Host "Starting Celery..."
Start-Process -FilePath cmd.exe -ArgumentList "/c start \"Financial Hub - Celery\" cmd /k \"$scriptDir\start-celery.bat\""
Start-Sleep -Seconds 2
Write-Host "Starting Frontend..."
Start-Process -FilePath cmd.exe -ArgumentList "/c start \"Financial Hub - Frontend\" cmd /k \"$scriptDir\start-frontend.bat\""
Write-Host "All services started (Backend: http://localhost:8000 ; Frontend: http://localhost:3000)"
Pop-Location

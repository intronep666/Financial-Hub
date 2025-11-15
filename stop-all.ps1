Param()
Set-StrictMode -Version Latest
Write-Host "Stopping all Financial Hub services..."
# Use taskkill to stop windows launched by START commands in Windows
taskkill /FI "WINDOWTITLE eq Financial Hub - Backend*" /T /F 2>$null
taskkill /FI "WINDOWTITLE eq Financial Hub - Celery*" /T /F 2>$null
taskkill /FI "WINDOWTITLE eq Financial Hub - Frontend*" /T /F 2>$null
Write-Host "Done!"

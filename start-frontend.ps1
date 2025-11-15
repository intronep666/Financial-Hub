Param()
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot\frontend
$env:VITE_API_URL = $env:VITE_API_URL -or 'http://localhost:8000'
Write-Host "Starting Frontend (Vite dev) with VITE_API_URL=$env:VITE_API_URL"
If (Test-Path "node_modules\.bin\vite") {
    npm run dev -- --host
} else {
    npm run dev -- --host
}
Pop-Location

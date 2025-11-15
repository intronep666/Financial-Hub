param(
    [string]$BaseUrl = "http://localhost:8000"
)

Write-Host "Health check: $BaseUrl/health"
$resp = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -ErrorAction SilentlyContinue
if (-not $resp -or $resp.StatusCode -ne 200) {
    Write-Error "Health check failed: $($resp.StatusCode)"
    exit 1
}

Write-Host "Registering test user..."
Invoke-WebRequest -Uri "$BaseUrl/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"smoke_user","password":"SmokePass1!","email":"smoke@example.com"}' -ErrorAction SilentlyContinue

Write-Host "Logging in and storing cookie..."
$login = Invoke-WebRequest -Uri "$BaseUrl/auth/token" -Method POST -Body "username=smoke_user&password=SmokePass1!" -ContentType "application/x-www-form-urlencoded" -SessionVariable session -ErrorAction Stop

Write-Host "Creating a transaction..."
Write-Host "Fetching categories to get a valid category_id..."
$cats = Invoke-WebRequest -Uri "$BaseUrl/categories" -Method GET -WebSession $session -ErrorAction SilentlyContinue
$json = $cats.Content | ConvertFrom-Json
$category_id = if ($json -and $json.Count -gt 0) { $json[0].id } else { 1 }
Write-Host "Using category id: $category_id"
Invoke-WebRequest -Uri "$BaseUrl/transactions" -Method POST -ContentType "application/json" -Body ("{`"description`":`"Smoke test transaction`",`"amount`":5.0,`"type`":`"expense`",`"category_id`":$category_id}") -WebSession $session -ErrorAction SilentlyContinue

Write-Host "Listing transactions (limit=10)..."
$list = Invoke-WebRequest -Uri "$BaseUrl/transactions?limit=10" -Method GET -WebSession $session -ErrorAction SilentlyContinue
Write-Host $list.Content

Write-Host "Smoke test finished: OK"

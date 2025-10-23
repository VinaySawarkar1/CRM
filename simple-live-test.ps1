# Simple Live API Test
$API_BASE = "https://crm-bhg1.onrender.com"

Write-Host "Testing Live API at $API_BASE" -ForegroundColor Green

$endpoints = @(
    "/api/user",
    "/api/customers", 
    "/api/leads",
    "/api/quotations",
    "/api/inventory",
    "/api/tasks",
    "/api/dashboard/stats"
)

$passed = 0
$failed = 0

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE$endpoint" -UseBasicParsing -TimeoutSec 30
        Write-Host "✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "❌ $endpoint : Error - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nSummary: $passed passed, $failed failed" -ForegroundColor Yellow

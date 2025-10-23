# Live API Test with Authentication
$API_BASE = "https://crm-bhg1.onrender.com"

Write-Host "Testing Live API with Authentication at $API_BASE" -ForegroundColor Green

# Test login first
Write-Host "`n🔐 Testing Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "$API_BASE/api/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -SessionVariable session
    
    Write-Host "✅ Login successful: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    # Now test protected endpoints with session
    Write-Host "`n📋 Testing Protected Endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        "/api/user",
        "/api/customers", 
        "/api/leads",
        "/api/quotations",
        "/api/inventory",
        "/api/tasks",
        "/api/dashboard/stats",
        "/api/lead-categories",
        "/api/proformas",
        "/api/orders",
        "/api/purchase-orders"
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$API_BASE$endpoint" -WebSession $session -UseBasicParsing -TimeoutSec 30
            
            # Try to parse JSON to get record count
            try {
                $data = $response.Content | ConvertFrom-Json
                if ($data -is [array]) {
                    $recordCount = $data.Count
                } else {
                    $recordCount = "Object"
                }
            } catch {
                $recordCount = "Non-JSON"
            }
            
            Write-Host "✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
            if ($recordCount -ne "Object" -and $recordCount -ne "Non-JSON") {
                Write-Host "   📊 Records: $recordCount" -ForegroundColor Gray
            }
            $passed++
        } catch {
            Write-Host "❌ $endpoint : Error - $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "✅ Passed: $passed" -ForegroundColor Green
    Write-Host "❌ Failed: $failed" -ForegroundColor Red
    Write-Host "📈 Success Rate: $([math]::Round(($passed / $endpoints.Count) * 100, 1))%" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔍 Testing Public Endpoints..." -ForegroundColor Yellow
    
    # Test some public endpoints that might not require auth
    $publicEndpoints = @(
        "/",
        "/api/health",
        "/api/status"
    )
    
    foreach ($endpoint in $publicEndpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$API_BASE$endpoint" -UseBasicParsing -TimeoutSec 10
            Write-Host "✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $endpoint : Error - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

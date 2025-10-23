# Live API Test for https://crm-bhg1.onrender.com/quotations
# Tests the live Render deployment

$API_BASE = "https://crm-bhg1.onrender.com"

Write-Host "🧪 Testing Live API at https://crm-bhg1.onrender.com/quotations" -ForegroundColor Green
Write-Host "📍 Base URL: $API_BASE" -ForegroundColor Yellow
Write-Host "🕐 Started at: $(Get-Date)" -ForegroundColor Yellow

# Test endpoints
$endpoints = @(
    @{ Path = "/api/user"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/customers"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/leads"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/quotations"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/inventory"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/tasks"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/dashboard/stats"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/lead-categories"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/proformas"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/orders"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/purchase-orders"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/quotation-templates"; Method = "GET"; ExpectedStatus = 200 },
    @{ Path = "/api/company-settings"; Method = "GET"; ExpectedStatus = 200 }
)

$results = @()
$passed = 0
$failed = 0

Write-Host "`n📋 Testing $($endpoints.Count) API endpoints on live server...`n" -ForegroundColor Cyan

foreach ($endpoint in $endpoints) {
    $progress = "[$($endpoints.IndexOf($endpoint) + 1)/$($endpoints.Count)]"
    Write-Host "$progress Testing $($endpoint.Method) $($endpoint.Path)..." -ForegroundColor White
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri "$API_BASE$($endpoint.Path)" -Method $endpoint.Method -UseBasicParsing -ErrorAction Stop
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        $result = @{
            Endpoint = $endpoint.Path
            Method = $endpoint.Method
            Status = $response.StatusCode
            Success = $response.StatusCode -eq $endpoint.ExpectedStatus
            ResponseTime = $responseTime
            Data = $null
        }
        
        # Try to parse JSON response
        try {
            $result.Data = $response.Content | ConvertFrom-Json
            if ($result.Data -is [array]) {
                $recordCount = $result.Data.Count
            } else {
                $recordCount = "Object"
            }
        } catch {
            $recordCount = "Non-JSON"
        }
        
        if ($result.Success) {
            Write-Host "✅ $($endpoint.Path): $($response.StatusCode) - PASSED ($([math]::Round($responseTime, 2))ms)" -ForegroundColor Green
            if ($recordCount -ne "Object" -and $recordCount -ne "Non-JSON") {
                Write-Host "   📊 Found $recordCount records" -ForegroundColor Gray
            }
            $passed++
        } else {
            Write-Host "❌ $($endpoint.Path): $($response.StatusCode) - FAILED ($([math]::Round($responseTime, 2))ms)" -ForegroundColor Red
            Write-Host "   Expected: $($endpoint.ExpectedStatus), Got: $($response.StatusCode)" -ForegroundColor Red
            $failed++
        }
        
        $results += $result
        
    } catch {
        $result = @{
            Endpoint = $endpoint.Path
            Method = $endpoint.Method
            Status = 0
            Success = $false
            ResponseTime = 0
            Error = $_.Exception.Message
        }
        
        Write-Host "❌ $($endpoint.Path): Error - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
        $results += $result
    }
    
    Start-Sleep -Milliseconds 500
}

# Summary Report
Write-Host "`n" + "="*70 -ForegroundColor Magenta
Write-Host "📊 LIVE API TEST SUMMARY" -ForegroundColor Magenta
Write-Host "="*70 -ForegroundColor Magenta
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "📈 Success Rate: $([math]::Round(($passed / $endpoints.Count) * 100, 1))%" -ForegroundColor Yellow
Write-Host "🌐 Base URL: $API_BASE" -ForegroundColor Yellow
Write-Host "🕐 Completed at: $(Get-Date)" -ForegroundColor Yellow

# Calculate average response time
$avgResponseTime = ($results | Where-Object { $_.ResponseTime -gt 0 } | Measure-Object -Property ResponseTime -Average).Average
if ($avgResponseTime) {
    Write-Host "⚡ Average Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Yellow
}

# Show slow endpoints
$slowEndpoints = $results | Where-Object { $_.ResponseTime -gt 5000 }
if ($slowEndpoints.Count -gt 0) {
    Write-Host "`n🐌 Slow Endpoints (>5000ms):" -ForegroundColor Red
    foreach ($slow in $slowEndpoints) {
        Write-Host "   $($slow.Method) $($slow.Endpoint): $([math]::Round($slow.ResponseTime, 2))ms" -ForegroundColor Red
    }
}

# Show data summary
Write-Host "`n📊 DATA SUMMARY:" -ForegroundColor Cyan
$dataEndpoints = $results | Where-Object { $_.Data -is [array] }
foreach ($data in $dataEndpoints) {
    Write-Host "   $($data.Endpoint): $($data.Data.Count) records" -ForegroundColor Gray
}

# Health check
Write-Host "`n🏥 HEALTH CHECK:" -ForegroundColor Yellow
$criticalEndpoints = @('/api/user', '/api/customers', '/api/leads', '/api/quotations')
foreach ($critical in $criticalEndpoints) {
    $result = $results | Where-Object { $_.Endpoint -eq $critical }
    if ($result) {
        $status = if ($result.Success) { "✅" } else { "❌" }
        Write-Host "   $critical : $status" -ForegroundColor $(if ($result.Success) { "Green" } else { "Red" })
    } else {
        Write-Host "   $critical : ⚠️" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Live API testing completed!" -ForegroundColor Green
Write-Host "📊 Total endpoints tested: $($endpoints.Count)" -ForegroundColor Yellow

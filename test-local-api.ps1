# Local API Testing Script for Reckonix CRM
# Run this in PowerShell to test all API endpoints locally

$API_BASE = "http://localhost:3001"
$results = @()

Write-Host "🧪 Starting Local API Tests for Reckonix CRM..." -ForegroundColor Green
Write-Host "📍 Testing at: $API_BASE" -ForegroundColor Yellow
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

$passed = 0
$failed = 0

Write-Host "`n📋 Testing $($endpoints.Count) API endpoints locally...`n" -ForegroundColor Cyan

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
    
    Start-Sleep -Milliseconds 100
}

# Summary Report
Write-Host "`n" + "="*70 -ForegroundColor Magenta
Write-Host "📊 LOCAL API TEST SUMMARY" -ForegroundColor Magenta
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
$slowEndpoints = $results | Where-Object { $_.ResponseTime -gt 1000 }
if ($slowEndpoints.Count -gt 0) {
    Write-Host "`n🐌 Slow Endpoints (>1000ms):" -ForegroundColor Red
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

Write-Host "`n🎉 Local API testing completed!" -ForegroundColor Green
Write-Host "📊 Total endpoints tested: $($endpoints.Count)" -ForegroundColor Yellow

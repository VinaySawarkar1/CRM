# Start ngrok and show the URL
Write-Host "🚀 Starting ngrok tunnel..." -ForegroundColor Green
Write-Host "⏳ Please wait for the tunnel to establish..." -ForegroundColor Yellow

# Start ngrok in background
$ngrokProcess = Start-Process -FilePath ".\ngrok.exe" -ArgumentList "http", "8080" -PassThru -WindowStyle Hidden

# Wait a moment for ngrok to start
Start-Sleep -Seconds 8

# Try to get the tunnel information
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
    $tunnels = $response.Content | ConvertFrom-Json
    
    if ($tunnels.tunnels -and $tunnels.tunnels.Count -gt 0) {
        $publicUrl = $tunnels.tunnels[0].public_url
        Write-Host ""
        Write-Host "🌐 ================================================" -ForegroundColor Cyan
        Write-Host "🌍 YOUR GLOBAL ACCESS URL:" -ForegroundColor Green
        Write-Host "🔗 $publicUrl" -ForegroundColor White -BackgroundColor Black
        Write-Host "🌐 ================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ Your website is now accessible from ANYWHERE!" -ForegroundColor Green
        Write-Host "📱 Share this URL with anyone to access your website" -ForegroundColor Yellow
        Write-Host "🌍 This URL works from any network, any device!" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ Could not get tunnel URL. Please check if ngrok is running." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting tunnel information: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure ngrok is running and try again." -ForegroundColor Yellow
}

# Clean up
if ($ngrokProcess) {
    $ngrokProcess.Kill()
}





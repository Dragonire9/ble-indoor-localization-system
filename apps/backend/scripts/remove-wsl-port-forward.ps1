# Remove WSL port forwarding
# Run this as Administrator in PowerShell

netsh interface portproxy delete v4tov4 listenport=1883 listenaddress=127.0.0.1

Write-Host "Port forwarding removed for port 1883" -ForegroundColor Green

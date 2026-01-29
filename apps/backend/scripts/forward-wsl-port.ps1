# Port forwarding script for WSL MQTT broker
# Run this as Administrator in PowerShell

# Get WSL IP address
$wslIp = (wsl hostname -I).Split()[0]
Write-Host "WSL IP Address: $wslIp" -ForegroundColor Green

# Remove existing port forwarding if it exists
netsh interface portproxy delete v4tov4 listenport=1883 listenaddress=127.0.0.1 2>$null

# Add port forwarding from Windows localhost:1883 to WSL IP:1883
netsh interface portproxy add v4tov4 listenport=1883 listenaddress=127.0.0.1 connectport=1883 connectaddress=$wslIp

Write-Host "Port forwarding configured:" -ForegroundColor Green
Write-Host "  Windows localhost:1883 -> WSL $wslIp:1883" -ForegroundColor Cyan

# Show current port forwarding rules
Write-Host "`nCurrent port forwarding rules:" -ForegroundColor Yellow
netsh interface portproxy show all

Write-Host "`nNote: Run this script again if WSL IP changes after restart." -ForegroundColor Yellow

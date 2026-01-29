# PowerShell script to create default admin user
# Usage: .\scripts\create-user.ps1 [email] [password] [name]

param(
    [string]$Email = "admin@example.com",
    [string]$Password = "admin123",
    [string]$Name = "Admin User"
)

$baseURL = $env:BETTER_AUTH_URL
if (-not $baseURL) {
    $baseURL = "http://localhost:8000"
}

$url = "$baseURL/api/auth/sign-up/email"
$body = @{
    email = $Email
    password = $Password
    name = $Name
} | ConvertTo-Json

Write-Host "Creating user: $Email" -ForegroundColor Cyan
Write-Host "Calling: $url" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host ""
    Write-Host "User created successfully!" -ForegroundColor Green
    Write-Host "   Email: $Email" -ForegroundColor White
    Write-Host "   Password: $Password" -ForegroundColor White
    Write-Host ""
    Write-Host 'IMPORTANT: Change the default password in production!' -ForegroundColor Yellow
} 
# catch {
#     Write-Host ""
# Write-Host "Status/Message: $($_.Exception.Message)" -ForegroundColor Yellow

# if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
#     Write-Host "Server response body:" -ForegroundColor Yellow
#     Write-Host $_.ErrorDetails.Message -ForegroundColor DarkYellow
# }

#     $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    
#     if ($errorResponse -and $errorResponse.error.message) {
#         $errorMsg = $errorResponse.error.message
        
#         if ($errorMsg -match "already exists|duplicate|unique") {
#             Write-Host ""
#             Write-Host "User with email $Email already exists" -ForegroundColor Yellow
#             Write-Host ""
#             Write-Host "You can use this account to login:" -ForegroundColor Cyan
#             Write-Host "   Email: $Email" -ForegroundColor White
#             Write-Host "   Password: $Password" -ForegroundColor White
#         } else {
#             Write-Host ""
#             Write-Host "Failed to create user" -ForegroundColor Red
#             Write-Host "   Error: $errorMsg" -ForegroundColor Red
#             exit 1
#         }
#     } else {
#         Write-Host ""
#         Write-Host "Failed to create user" -ForegroundColor Red
#         Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
#         Write-Host ""
#         exit 1
#     }
# }
catch {
    Write-Host ""
    Write-Host "Status/Message: $($_.Exception.Message)" -ForegroundColor Yellow

    # Try to extract HTTP status code + response body
    $statusCode = $null
    $rawBody = $null

    try {
        if ($_.Exception.Response) {
            # Windows PowerShell 5.1 / .NET Framework style
            try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}

            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $rawBody = $reader.ReadToEnd()
                $reader.Close()
            }
        }
    } catch {}

    if ($statusCode) {
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Yellow
    }

    if ($rawBody) {
        Write-Host "Server response body:" -ForegroundColor Yellow
        Write-Host $rawBody -ForegroundColor DarkYellow

        # Try parse JSON for nicer message
        try {
            $parsed = $rawBody | ConvertFrom-Json
            if ($parsed.error -and $parsed.error.message) {
                Write-Host ""
                Write-Host "Parsed error message: $($parsed.error.message)" -ForegroundColor Red
            } elseif ($parsed.message) {
                Write-Host ""
                Write-Host "Parsed message: $($parsed.message)" -ForegroundColor Red
            }
        } catch {}
    } else {
        Write-Host "No response body was returned (or PowerShell couldn't read it)." -ForegroundColor Yellow
        Write-Host "Tip: try Invoke-WebRequest to see the raw response." -ForegroundColor Yellow
    }

    exit 1
}

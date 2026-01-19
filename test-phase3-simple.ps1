# Phase 3: File Sharing Testing Script
Write-Host "=== PHASE 3: FILE SHARING TESTING ===" -ForegroundColor Cyan
Write-Host ""

# Load token
$token = Get-Content "token.txt"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:3333"
$fileId = 1
$recipientUserId = 12

Write-Host "Test Configuration:" -ForegroundColor Yellow
Write-Host "  File ID: $fileId"
Write-Host "  Recipient User ID: $recipientUserId"
Write-Host ""

# Test 1: Share file with user (Private Share)
Write-Host "Test 1: Share file with user (Private Share)" -ForegroundColor Green
try {
    $body = '{"sharedWithId":' + $recipientUserId + ',"accessType":"download"}'
    $response = Invoke-RestMethod -Uri "$baseUrl/files/$fileId/share" -Method POST -Headers $headers -Body $body
    Write-Host "  ✓ Private share created successfully" -ForegroundColor Green
    Write-Host "  Share ID: $($response.id)"
    Write-Host "  Access Type: $($response.accessType)"
    $script:privateShareId = $response.id
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Create public share link
Write-Host "Test 2: Create public share link" -ForegroundColor Green
try {
    $body = '{"accessType":"view","expiredAt":"2027-12-31T23:59:59Z"}'
    $response = Invoke-RestMethod -Uri "$baseUrl/files/$fileId/share/public" -Method POST -Headers $headers -Body $body
    Write-Host "  ✓ Public share created successfully" -ForegroundColor Green
    Write-Host "  Public Token: $($response.publicToken)"
    Write-Host "  Share URL: $($response.shareUrl)"
    $script:publicShareId = $response.id
    $script:publicToken = $response.publicToken
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: List all shares for the file
Write-Host "Test 3: List all shares for the file" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/files/$fileId/shares" -Method GET -Headers $headers
    Write-Host "  ✓ Retrieved $($response.Count) shares" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: List files I shared
Write-Host "Test 4: List files I shared" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/shares/owned" -Method GET -Headers $headers
    Write-Host "  ✓ Retrieved $($response.Count) owned shares" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: View public share (no auth)
Write-Host "Test 5: View public share info (no auth)" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/share/$script:publicToken" -Method GET
    Write-Host "  ✓ Public share info retrieved" -ForegroundColor Green
    Write-Host "  File: $($response.file.originalName)"
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Update share to allow download
Write-Host "Test 6: Update public share to allow download" -ForegroundColor Green
try {
    $body = '{"accessType":"download"}'
    $response = Invoke-RestMethod -Uri "$baseUrl/shares/$script:publicShareId" -Method PUT -Headers $headers -Body $body
    Write-Host "  ✓ Share updated successfully" -ForegroundColor Green
    Write-Host "  New Access Type: $($response.accessType)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Download via public share
Write-Host "Test 7: Download via public share" -ForegroundColor Green
try {
    Invoke-WebRequest -Uri "$baseUrl/share/$script:publicToken/download" -Method GET -OutFile "downloaded-public.txt"
    Write-Host "  ✓ File downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Login as recipient user
Write-Host "Test 8: Login as recipient user (john_doe)" -ForegroundColor Green
try {
    $loginBody = '{"email":"john@example.com","password":"password123"}'
    $response = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $script:recipientToken = $response.token
    Write-Host "  ✓ Logged in as john_doe" -ForegroundColor Green
    
    $script:recipientHeaders = @{
        "Authorization" = "Bearer $script:recipientToken"
        "Content-Type" = "application/json"
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: View received shares as recipient
Write-Host "Test 9: View received shares as recipient" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/shares/received" -Method GET -Headers $script:recipientHeaders
    Write-Host "  ✓ Retrieved $($response.Count) received shares" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Download shared file as recipient
Write-Host "Test 10: Download shared file as recipient" -ForegroundColor Green
try {
    Invoke-WebRequest -Uri "$baseUrl/files/$fileId/download/shared" -Method GET -Headers $script:recipientHeaders -OutFile "downloaded-private.txt"
    Write-Host "  ✓ File downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 11: Revoke private share
Write-Host "Test 11: Revoke private share (as owner)" -ForegroundColor Green
try {
    Invoke-RestMethod -Uri "$baseUrl/shares/$script:privateShareId" -Method DELETE -Headers $headers
    Write-Host "  ✓ Private share revoked successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 12: Revoke public share
Write-Host "Test 12: Revoke public share" -ForegroundColor Green
try {
    Invoke-RestMethod -Uri "$baseUrl/shares/$script:publicShareId" -Method DELETE -Headers $headers
    Write-Host "  ✓ Public share revoked successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== PHASE 3 TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Private sharing tested"
Write-Host "  ✓ Public sharing tested"
Write-Host "  ✓ Share listing tested"
Write-Host "  ✓ Share updates tested"
Write-Host "  ✓ Share revocation tested"
Write-Host "  ✓ Download permissions tested"
Write-Host ""

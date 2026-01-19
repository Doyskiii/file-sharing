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
    $body = @{
        sharedWithId = $recipientUserId
        accessType = "download"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/share" -Method POST -Headers $headers -Body $body
    $share = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Private share created successfully" -ForegroundColor Green
    Write-Host "  Share ID: $($share.id)"
    Write-Host "  Access Type: $($share.accessType)"
    Write-Host "  Recipient ID: $($share.sharedWithId)"
    $privateShareId = $share.id
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Try to share with self (should fail)
Write-Host "Test 2: Try to share with self (should fail)" -ForegroundColor Green
try {
    $body = @{
        sharedWithId = 1
        accessType = "view"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/share" -Method POST -Headers $headers -Body $body
        Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    } catch {
        Write-Host "  ✓ Correctly rejected sharing with self" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create public share link
Write-Host "Test 3: Create public share link" -ForegroundColor Green
try {
    $body = @{
        accessType = "view"
        expiredAt = "2027-12-31T23:59:59Z"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/share/public" -Method POST -Headers $headers -Body $body
    $publicShare = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Public share created successfully" -ForegroundColor Green
    Write-Host "  Share ID: $($publicShare.id)"
    Write-Host "  Public Token: $($publicShare.publicToken)"
    Write-Host "  Share URL: $($publicShare.shareUrl)"
    Write-Host "  Access Type: $($publicShare.accessType)"
    Write-Host "  Expires At: $($publicShare.expiredAt)"
    $publicShareId = $publicShare.id
    $publicToken = $publicShare.publicToken
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: List all shares for the file
Write-Host "Test 4: List all shares for the file" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/shares" -Method GET -Headers $headers
    $shares = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Retrieved $($shares.Count) shares" -ForegroundColor Green
    foreach ($share in $shares) {
        Write-Host "    - Share ID: $($share.id), Type: $(if($share.isPublic){'Public'}else{'Private'}), Access: $($share.accessType)"
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: List files shared with me (as admin, should be empty)
Write-Host "Test 5: List files shared with me" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/received" -Method GET -Headers $headers
    $receivedShares = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Retrieved $($receivedShares.Count) received shares" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: List files I shared
Write-Host "Test 6: List files I shared" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/owned" -Method GET -Headers $headers
    $ownedShares = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Retrieved $($ownedShares.Count) owned shares" -ForegroundColor Green
    foreach ($share in $ownedShares) {
        Write-Host "    - File: $($share.file.originalName), Shared with: $(if($share.recipient){$share.recipient.username}else{'Public'})"
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: View public share (no auth)
Write-Host "Test 7: View public share info (no auth)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/share/$publicToken" -Method GET
    $shareInfo = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Public share info retrieved" -ForegroundColor Green
    Write-Host "  File: $($shareInfo.file.originalName)"
    Write-Host "  Size: $($shareInfo.file.size) bytes"
    Write-Host "  Owner: $($shareInfo.owner.username)"
    Write-Host "  Access Type: $($shareInfo.share.accessType)"
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Try to download via public share (should fail - view only)
Write-Host "Test 8: Try to download via public share (should fail - view only)" -ForegroundColor Green
try {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/share/$publicToken/download" -Method GET
        Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    } catch {
        Write-Host "  ✓ Correctly rejected download (view-only access)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Update share to allow download
Write-Host "Test 9: Update public share to allow download" -ForegroundColor Green
try {
    $body = @{
        accessType = "download"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/$publicShareId" -Method PUT -Headers $headers -Body $body
    $updatedShare = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Share updated successfully" -ForegroundColor Green
    Write-Host "  New Access Type: $($updatedShare.accessType)"
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Download via public share (should work now)
Write-Host "Test 10: Download via public share (should work now)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/share/$publicToken/download" -Method GET -OutFile "downloaded-public.txt"
    Write-Host "  ✓ File downloaded successfully via public share" -ForegroundColor Green
    Write-Host "  Saved as: downloaded-public.txt"
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 11: Login as recipient user
Write-Host "Test 11: Login as recipient user (john_doe)" -ForegroundColor Green
try {
    $loginBody = @{
        email = "john@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $loginData = $response.Content | ConvertFrom-Json
    $recipientToken = $loginData.token
    Write-Host "  ✓ Logged in as john_doe" -ForegroundColor Green
    
    $recipientHeaders = @{
        "Authorization" = "Bearer $recipientToken"
        "Content-Type" = "application/json"
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 12: View received shares as recipient
Write-Host "Test 12: View received shares as recipient" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/received" -Method GET -Headers $recipientHeaders
    $receivedShares = $response.Content | ConvertFrom-Json
    Write-Host "  ✓ Retrieved $($receivedShares.Count) received shares" -ForegroundColor Green
    foreach ($share in $receivedShares) {
        Write-Host "    - File: $($share.file.originalName), From: $($share.owner.username), Access: $($share.accessType)"
    }
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 13: Download shared file as recipient
Write-Host "Test 13: Download shared file as recipient" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/download/shared" -Method GET -Headers $recipientHeaders -OutFile "downloaded-private.txt"
    Write-Host "  ✓ File downloaded successfully via private share" -ForegroundColor Green
    Write-Host "  Saved as: downloaded-private.txt"
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 14: Revoke private share (as owner)
Write-Host "Test 14: Revoke private share (as owner)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/$privateShareId" -Method DELETE -Headers $headers
    Write-Host "  ✓ Private share revoked successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 15: Try to download after revocation (should fail)
Write-Host "Test 15: Try to download after revocation (should fail)" -ForegroundColor Green
try {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/download/shared" -Method GET -Headers $recipientHeaders
        Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    } catch {
        Write-Host "  ✓ Correctly rejected access after revocation" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 16: Revoke public share
Write-Host "Test 16: Revoke public share" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/shares/$publicShareId" -Method DELETE -Headers $headers
    Write-Host "  ✓ Public share revoked successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 17: Try to access revoked public share (should fail)
Write-Host "Test 17: Try to access revoked public share (should fail)" -ForegroundColor Green
try {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/share/$publicToken" -Method GET
        Write-Host "  ✗ Should have failed but succeeded" -ForegroundColor Red
    } catch {
        Write-Host "  ✓ Correctly rejected access to revoked public share" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== PHASE 3 TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Private sharing: Tested ✓"
Write-Host "  - Public sharing: Tested ✓"
Write-Host "  - Share listing: Tested ✓"
Write-Host "  - Share updates: Tested ✓"
Write-Host "  - Share revocation: Tested ✓"
Write-Host "  - Access control: Tested ✓"
Write-Host "  - Download permissions: Tested ✓"
Write-Host ""

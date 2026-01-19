# Phase 4: Activity Logging Test Script
# Tests authentication activity logging and activity viewing endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 4: Activity Logging Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3333"
$testsPassed = 0
$testsFailed = 0

# Test credentials (from database seeder)
$adminEmail = "Admin@example.com"
$adminPassword = "Admin123"
$userEmail = "User@example.com"
$userPassword = "User1234"

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message
        return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody }
    }
}

# Test 1: Admin Login (Should log activity)
Write-Host "Test 1: Admin Login" -ForegroundColor Yellow
$loginResult = Invoke-ApiRequest -Method POST -Url "$baseUrl/login" -Body @{
    email = $adminEmail
    password = $adminPassword
}

if ($loginResult.Success) {
    $adminToken = $loginResult.Data.token
    Write-Host "✓ Admin login successful" -ForegroundColor Green
    Write-Host "  Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
    $testsPassed++
} else {
    Write-Host "✗ Admin login failed: $($loginResult.Error)" -ForegroundColor Red
    $testsFailed++
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Regular User Login (Should log activity)
Write-Host "`nTest 2: Regular User Login" -ForegroundColor Yellow
$userLoginResult = Invoke-ApiRequest -Method POST -Url "$baseUrl/login" -Body @{
    email = $userEmail
    password = $userPassword
}

if ($userLoginResult.Success) {
    $userToken = $userLoginResult.Data.token
    Write-Host "✓ User login successful" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "✗ User login failed: $($userLoginResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 3: Get My Activities (Regular User)
Write-Host "`nTest 3: Get My Activities (Regular User)" -ForegroundColor Yellow
$myActivitiesResult = Invoke-ApiRequest -Method GET -Url "$baseUrl/activities/me" -Headers @{
    "Authorization" = "Bearer $userToken"
}

if ($myActivitiesResult.Success) {
    $activities = $myActivitiesResult.Data.data
    Write-Host "✓ Retrieved my activities" -ForegroundColor Green
    Write-Host "  Total activities: $($activities.Count)" -ForegroundColor Gray
    
    if ($activities.Count -gt 0) {
        Write-Host "  Recent activities:" -ForegroundColor Gray
        $activities | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.action) at $($_.createdAt)" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    Write-Host "✗ Failed to get my activities: $($myActivitiesResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 4: Get My Statistics (Regular User)
Write-Host "`nTest 4: Get My Statistics (Regular User)" -ForegroundColor Yellow
$myStatsResult = Invoke-ApiRequest -Method GET -Url "$baseUrl/activities/stats/me" -Headers @{
    "Authorization" = "Bearer $userToken"
}

if ($myStatsResult.Success) {
    $stats = $myStatsResult.Data
    Write-Host "✓ Retrieved my statistics" -ForegroundColor Green
    Write-Host "  Total activities: $($stats.total)" -ForegroundColor Gray
    
    if ($stats.byAction) {
        Write-Host "  Activities by action:" -ForegroundColor Gray
        $stats.byAction | ForEach-Object {
            Write-Host "    - $($_.action): $($_.count)" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    Write-Host "✗ Failed to get my statistics: $($myStatsResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 5: Get All Activities (Admin Only)
Write-Host "`nTest 5: Get All Activities (Admin Only)" -ForegroundColor Yellow
$allActivitiesResult = Invoke-ApiRequest -Method GET -Url "$baseUrl/activities?limit=10" -Headers @{
    "Authorization" = "Bearer $adminToken"
}

if ($allActivitiesResult.Success) {
    $allActivities = $allActivitiesResult.Data.data
    Write-Host "✓ Retrieved all activities (admin)" -ForegroundColor Green
    Write-Host "  Total activities retrieved: $($allActivities.Count)" -ForegroundColor Gray
    
    if ($allActivities.Count -gt 0) {
        Write-Host "  Recent activities:" -ForegroundColor Gray
        $allActivities | Select-Object -First 5 | ForEach-Object {
            $userName = if ($_.user) { $_.user.username } else { "Unknown" }
            Write-Host "    - $userName : $($_.action) at $($_.createdAt)" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    Write-Host "✗ Failed to get all activities: $($allActivitiesResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 6: Get All Activities (Regular User - Should Fail)
Write-Host "`nTest 6: Get All Activities (Regular User - Should Fail)" -ForegroundColor Yellow
$unauthorizedResult = Invoke-ApiRequest -Method GET -Url "$baseUrl/activities" -Headers @{
    "Authorization" = "Bearer $userToken"
}

if (!$unauthorizedResult.Success -and $unauthorizedResult.StatusCode -eq 403) {
    Write-Host "✓ Correctly denied access to regular user" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "✗ Security issue: Regular user can access admin endpoint" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 7: Get Global Statistics (Admin Only)
Write-Host "`nTest 7: Get Global Statistics (Admin Only)" -ForegroundColor Yellow
$globalStatsResult = Invoke-ApiRequest -Method GET -Url "$baseUrl/activities/stats" -Headers @{
    "Authorization" = "Bearer $adminToken"
}

if ($globalStatsResult.Success) {
    $globalStats = $globalStatsResult.Data
    Write-Host "✓ Retrieved global statistics" -ForegroundColor Green
    Write-Host "  Total activities: $($globalStats.total)" -ForegroundColor Gray
    
    if ($globalStats.byAction) {
        Write-Host "  Activities by action:" -ForegroundColor Gray
        $globalStats.byAction | Select-Object -First 5 | ForEach-Object {
            Write-Host "    - $($_.action): $($_.count)" -ForegroundColor Gray
        }
    }
    
    if ($globalStats.topUsers) {
        Write-Host "  Top active users:" -ForegroundColor Gray
        $globalStats.topUsers | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - User ID $($_.userId): $($_.count) activities" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    Write-Host "✗ Failed to get global statistics: $($globalStatsResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 8: Filter Activities by Action (Admin)
Write-Host "`nTest 8: Filter Activities by Action (Admin)" -ForegroundColor Yellow
$filterUrl = "$baseUrl/activities?action=auth:login&limit=5"
$filteredResult = Invoke-ApiRequest -Method GET -Url $filterUrl -Headers @{
    "Authorization" = "Bearer $adminToken"
}

if ($filteredResult.Success) {
    $filtered = $filteredResult.Data.data
    Write-Host "✓ Retrieved filtered activities" -ForegroundColor Green
    Write-Host "  Login activities found: $($filtered.Count)" -ForegroundColor Gray
    
    # Verify all are login activities
    $allLogin = $filtered | Where-Object { $_.action -eq "auth:login" }
    if ($allLogin.Count -eq $filtered.Count) {
        Write-Host "  ✓ All activities are login actions" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Filter not working correctly" -ForegroundColor Red
    }
    $testsPassed++
} else {
    Write-Host "✗ Failed to filter activities: $($filteredResult.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 9: Pagination Test
Write-Host "`nTest 9: Pagination Test" -ForegroundColor Yellow
$paginationUrl = "$baseUrl/activities/me?page=1&limit=2"
$page1Result = Invoke-ApiRequest -Method GET -Url $paginationUrl -Headers @{
    "Authorization" = "Bearer $userToken"
}

if ($page1Result.Success) {
    $page1 = $page1Result.Data
    Write-Host "✓ Pagination working" -ForegroundColor Green
    Write-Host "  Page 1 activities: $($page1.data.Count)" -ForegroundColor Gray
    Write-Host "  Meta - Page: $($page1.meta.page), Limit: $($page1.meta.limit)" -ForegroundColor Gray
    $testsPassed++
} else {
    Write-Host "✗ Pagination failed: $($page1Result.Error)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 1

# Test 10: Logout (Should log activity)
Write-Host "`nTest 10: Logout (Should log activity)" -ForegroundColor Yellow
$logoutResult = Invoke-ApiRequest -Method POST -Url "$baseUrl/logout" -Headers @{
    "Authorization" = "Bearer $userToken"
}

if ($logoutResult.Success) {
    Write-Host "✓ Logout successful (activity logged)" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "✗ Logout failed: $($logoutResult.Error)" -ForegroundColor Red
    $testsFailed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All Phase 4 Activity Logging tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the errors above." -ForegroundColor Red
    exit 1
}

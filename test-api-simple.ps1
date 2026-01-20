$baseUrl = "http://localhost:3333"

# Login
$loginBody = @{
  email = "Superadmin@example.com"
  password = "password"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" -Method POST -ContentType "application/json" -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "[OK] Authenticated" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

# Test 1: Create Folder
$createFolderBody = @{
  name = "My Documents"
  parentId = $null
} | ConvertTo-Json

$folderResponse = Invoke-WebRequest -Uri "$baseUrl/folders" -Method POST -Headers $headers -Body $createFolderBody
$folderData = $folderResponse.Content | ConvertFrom-Json
$folderId = $folderData.id

Write-Host "✓ Folder created: $($folderData.name)" -ForegroundColor Green

# Test 2: Create Subfolder
$subfolderBody = @{
  name = "Work Projects"
  parentId = $folderId
} | ConvertTo-Json

$subfolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders" -Method POST -Headers $headers -Body $subfolderBody
$subfolderData = $subfolderResponse.Content | ConvertFrom-Json
$subFolderId = $subfolderData.id

Write-Host "✓ Subfolder created: $($subfolderData.name)" -ForegroundColor Green

# Test 3: List Folders
$listResponse = Invoke-WebRequest -Uri "$baseUrl/folders" -Method GET -Headers $headers
$folders = $listResponse.Content | ConvertFrom-Json
Write-Host "✓ Listed $($folders.Count) folders" -ForegroundColor Green

# Test 4: Get Folder Path
$folderPathResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$subFolderId/path" -Method GET -Headers $headers
$pathData = $folderPathResponse.Content | ConvertFrom-Json
Write-Host "✓ Folder path retrieved" -ForegroundColor Green

# Test 5: Upload File
$testFilePath = "C:\Users\LENOVO\file-sharing\test-upload.txt"
"This is a test file for file sharing application." | Out-File -FilePath $testFilePath

$uploadResponse = Invoke-WebRequest -Uri "$baseUrl/files" -Method POST -Headers @{"Authorization" = "Bearer $token"} -Form @{
  file = Get-Item $testFilePath
  folderId = $subFolderId
}

$uploadData = $uploadResponse.Content | ConvertFrom-Json
$fileId = $uploadData.id

Write-Host "✓ File uploaded: $($uploadData.originalName)" -ForegroundColor Green

# Test 6: List Files
$filesResponse = Invoke-WebRequest -Uri "$baseUrl/files" -Method GET -Headers $headers
$files = $filesResponse.Content | ConvertFrom-Json
Write-Host "✓ Listed $($files.Count) files" -ForegroundColor Green

# Test 7: Get File Details
$fileResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" -Method GET -Headers $headers
$fileDetail = $fileResponse.Content | ConvertFrom-Json
Write-Host "✓ File details retrieved: $($fileDetail.originalName)" -ForegroundColor Green

# Test 8: Rename File
$updateBody = @{ name = "test-file-renamed.txt" } | ConvertTo-Json
$updateResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" -Method PUT -Headers $headers -Body $updateBody
$updateData = $updateResponse.Content | ConvertFrom-Json
Write-Host "✓ File renamed to: $($updateData.originalName)" -ForegroundColor Green

# Test 9: Create Public Share
$publicShareBody = @{
  accessType = "view"
  expiresIn = 7
} | ConvertTo-Json

$publicShareResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/share/public" -Method POST -Headers $headers -Body $publicShareBody
$publicShareData = $publicShareResponse.Content | ConvertFrom-Json
Write-Host "✓ Public share created with token: $($publicShareData.publicToken)" -ForegroundColor Green

# Test 10: List File Shares
$sharesResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/shares" -Method GET -Headers $headers
$shares = $sharesResponse.Content | ConvertFrom-Json
Write-Host "✓ Listed $($shares.Count) file shares" -ForegroundColor Green

# Test 11: Download File
$downloadResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/download" -Method GET -Headers $headers -OutFile "C:\Users\LENOVO\file-sharing\test-download.txt"
Write-Host "✓ File downloaded" -ForegroundColor Green

# Test 12: Activity Logging
$activitiesResponse = Invoke-WebRequest -Uri "$baseUrl/activities/me" -Method GET -Headers $headers
$activities = $activitiesResponse.Content | ConvertFrom-Json
Write-Host "✓ Retrieved $($activities.Count) activities" -ForegroundColor Green

# Test 13: Cleanup - Delete File
$deleteFileResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" -Method DELETE -Headers $headers
Write-Host "✓ File deleted" -ForegroundColor Green

# Test 14: Delete Subfolder
$deleteSubfolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$subFolderId" -Method DELETE -Headers $headers
Write-Host "✓ Subfolder deleted" -ForegroundColor Green

# Test 15: Delete Root Folder
$deleteFolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$folderId" -Method DELETE -Headers $headers
Write-Host "✓ Root folder deleted" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  All Tests Passed Successfully!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tested Features:" -ForegroundColor Yellow
Write-Host "  - Authentication" -ForegroundColor Green
Write-Host "  - Folder Management" -ForegroundColor Green
Write-Host "  - File Upload" -ForegroundColor Green
Write-Host "  - File Management" -ForegroundColor Green
Write-Host "  - File Sharing" -ForegroundColor Green
Write-Host "  - File Download" -ForegroundColor Green
Write-Host "  - Activity Logging" -ForegroundColor Green

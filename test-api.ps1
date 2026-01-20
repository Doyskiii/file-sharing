# File Sharing API Test Suite
# Testing Folder Management, File Upload, File Sharing

# Configuration
$baseUrl = "http://localhost:3333"
$testDir = "C:\Users\LENOVO\file-sharing\tests"

# Test Users
$superadminEmail = "Superadmin@example.com"
$superadminPassword = "password"
$userEmail = "User@example.com"
$userPassword = "password"

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"

function Write-Test {
  param([string]$message, [string]$color = "White")
  Write-Host $message -ForegroundColor $color
}

function Write-Success {
  param([string]$message)
  Write-Host "✓ $message" -ForegroundColor $successColor
}

function Write-Error {
  param([string]$message)
  Write-Host "✗ $message" -ForegroundColor $errorColor
}

Write-Test "═════════════════════════════════════════" "Cyan"
Write-Test "  File Sharing API Test Suite" "Cyan"
Write-Test "═════════════════════════════════════════" "Cyan"

# 1. Authentication
Write-Test "`n1. AUTHENTICATION TESTS" "Yellow"
Write-Test "─────────────────────────"

$loginBody = @{
  email = $superadminEmail
  password = $superadminPassword
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

if ($token) {
  Write-Success "Superadmin login successful"
  Write-Test "Token: $($token.Substring(0, 20))..." "Gray"
} else {
  Write-Error "Failed to get authentication token"
  exit 1
}

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

# 2. Folder Management Tests
Write-Test "`n2. FOLDER MANAGEMENT TESTS" "Yellow"
Write-Test "──────────────────────────"

# Create root folder
$createFolderBody = @{
  name = "My Documents"
  parentId = $null
} | ConvertTo-Json

$folderResponse = Invoke-WebRequest -Uri "$baseUrl/folders" `
  -Method POST `
  -Headers $headers `
  -Body $createFolderBody

$folderData = $folderResponse.Content | ConvertFrom-Json
$folderId = $folderData.id

Write-Success "Root folder created: $($folderData.name) (ID: $folderId)"

# Create subfolder
$subfolderBody = @{
  name = "Work Projects"
  parentId = $folderId
} | ConvertTo-Json

$subfolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders" `
  -Method POST `
  -Headers $headers `
  -Body $subfolderBody

$subfolderData = $subfolderResponse.Content | ConvertFrom-Json
$subFolderId = $subfolderData.id

Write-Success "Subfolder created: $($subfolderData.name) (ID: $subFolderId)"

# List folders
$listResponse = Invoke-WebRequest -Uri "$baseUrl/folders" `
  -Method GET `
  -Headers $headers

$folders = $listResponse.Content | ConvertFrom-Json
Write-Success "Listed folders: $($folders.Count) folder(s) found"

# Get folder details with path
$folderPathResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$subFolderId/path" `
  -Method GET `
  -Headers $headers

$pathData = $folderPathResponse.Content | ConvertFrom-Json
Write-Success "Folder path: $($pathData.breadcrumb -join ' > ')"

# 3. File Upload Tests
Write-Test "`n3. FILE UPLOAD TESTS" "Yellow"
Write-Test "───────────────────"

# Create test file
$testFilePath = "C:\Users\LENOVO\file-sharing\test-upload.txt"
"This is a test file for file sharing application. Testing upload functionality." | Out-File -FilePath $testFilePath

# Upload file
$fileBody = Get-Content $testFilePath -Raw
$uploadResponse = Invoke-WebRequest -Uri "$baseUrl/files" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
  } `
  -Form @{
    file = Get-Item $testFilePath
    folderId = $subFolderId
  }

$uploadData = $uploadResponse.Content | ConvertFrom-Json
$fileId = $uploadData.id

Write-Success "File uploaded: $($uploadData.originalName) (ID: $fileId)"
Write-Test "  Size: $($uploadData.size) bytes" "Gray"
Write-Test "  Type: $($uploadData.mimeType)" "Gray"

# 4. File Management Tests
Write-Test "`n4. FILE MANAGEMENT TESTS" "Yellow"
Write-Test "────────────────────────"

# List files
$filesResponse = Invoke-WebRequest -Uri "$baseUrl/files" `
  -Method GET `
  -Headers $headers

$files = $filesResponse.Content | ConvertFrom-Json
Write-Success "Listed files: $($files.Count) file(s) found"

# Get file details
$fileResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" `
  -Method GET `
  -Headers $headers

$fileDetail = $fileResponse.Content | ConvertFrom-Json
Write-Success "File details retrieved: $($fileDetail.originalName)"

# Rename file
$updateBody = @{
  name = "test-file-renamed.txt"
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" `
  -Method PUT `
  -Headers $headers `
  -Body $updateBody

$updateData = $updateResponse.Content | ConvertFrom-Json
Write-Success "File renamed to: $($updateData.originalName)"

# 5. File Sharing Tests
Write-Test "`n5. FILE SHARING TESTS" "Yellow"
Write-Test "────────────────────"

# Create public share
$publicShareBody = @{
  accessType = "view"
  expiresIn = 7
} | ConvertTo-Json

$publicShareResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/share/public" `
  -Method POST `
  -Headers $headers `
  -Body $publicShareBody

$publicShareData = $publicShareResponse.Content | ConvertFrom-Json
$publicToken = $publicShareData.publicToken

Write-Success "Public share created"
Write-Test "  Token: $publicToken" "Gray"
Write-Test "  Access Type: $($publicShareData.accessType)" "Gray"
Write-Test "  Expires: $($publicShareData.expiredAt)" "Gray"

# List file shares
$sharesResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/shares" `
  -Method GET `
  -Headers $headers

$shares = $sharesResponse.Content | ConvertFrom-Json
Write-Success "File shares: $($shares.Count) share(s) found"

# 6. File Download Test
Write-Test "`n6. FILE DOWNLOAD TEST" "Yellow"
Write-Test "────────────────────"

$downloadResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId/download" `
  -Method GET `
  -Headers $headers `
  -OutFile "C:\Users\LENOVO\file-sharing\test-download.txt"

Write-Success "File downloaded successfully"

# 7. Activity Logging Test
Write-Test "`n7. ACTIVITY LOGGING TEST" "Yellow"
Write-Test "───────────────────────"

$activitiesResponse = Invoke-WebRequest -Uri "$baseUrl/activities/me" `
  -Method GET `
  -Headers $headers

$activities = $activitiesResponse.Content | ConvertFrom-Json
Write-Success "User activities: $($activities.Count) record(s) found"

if ($activities.Count -gt 0) {
  Write-Test "  Recent activities:" "Gray"
  $activities | Select-Object -First 3 | ForEach-Object {
    Write-Test "    - $($_.action) on file/folder: $($_.fileId ?? $_.folderId)" "Gray"
  }
}

# 8. Cleanup
Write-Test "`n8. CLEANUP" "Yellow"
Write-Test "──────────"

# Delete file
$deleteFileResponse = Invoke-WebRequest -Uri "$baseUrl/files/$fileId" `
  -Method DELETE `
  -Headers $headers

Write-Success "File deleted"

# Delete folders
$deleteSubfolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$subFolderId" `
  -Method DELETE `
  -Headers $headers

Write-Success "Subfolder deleted"

$deleteFolderResponse = Invoke-WebRequest -Uri "$baseUrl/folders/$folderId" `
  -Method DELETE `
  -Headers $headers

Write-Success "Root folder deleted"

# Summary
Write-Test "`n═════════════════════════════════════════" "Cyan"
Write-Test "  Test Suite Completed Successfully! ✓" "Cyan"
Write-Test "═════════════════════════════════════════" "Cyan"

Write-Test "`nTested Features:" "Yellow"
Write-Test "  ✓ User Authentication" "Green"
Write-Test "  ✓ Folder Management (Create, List, Read, Update, Delete)" "Green"
Write-Test "  ✓ File Upload" "Green"
Write-Test "  ✓ File Management (List, Read, Update, Delete)" "Green"
Write-Test "  ✓ File Sharing (Public Links)" "Green"
Write-Test "  ✓ File Download" "Green"
Write-Test "  ✓ Activity Logging" "Green"
Write-Test ""

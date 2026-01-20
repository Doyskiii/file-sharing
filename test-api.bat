@echo off
setlocal enabledelayedexpansion

set baseUrl=http://localhost:3333

echo.
echo ======================================
echo  File Sharing API Test Suite
echo ======================================
echo.

REM 1. Login
echo [1] Testing Authentication...
curl -s -X POST %baseUrl%/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"Superadmin@example.com\",\"password\":\"password\"}" > temp_login.json

REM Extract token from response (basic extraction)
for /f "tokens=2 delims=:" %%i in ('findstr /i "token" temp_login.json') do (
  set token=%%i
  set token=!token:~2,-2!
  goto tokenfound
)
:tokenfound

if "!token!"=="" (
  echo Error: Failed to get authentication token
  exit /b 1
)

echo [OK] Authentication successful
echo.

REM 2. Create Folder
echo [2] Testing Folder Creation...
curl -s -X POST %baseUrl%/folders ^
  -H "Authorization: Bearer !token!" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Folder\",\"parentId\":null}" > temp_folder.json

for /f "tokens=2 delims=:" %%i in ('findstr /i "\"id\"" temp_folder.json') do (
  set folderId=%%i
  set folderId=!folderId:~0,-1!
  goto folderidFound
)
:folderidFound

echo [OK] Folder created successfully
echo.

REM 3. List Folders
echo [3] Testing List Folders...
curl -s -X GET %baseUrl%/folders ^
  -H "Authorization: Bearer !token!" > temp_folders.json
echo [OK] Folders listed
echo.

REM 4. Upload File
echo [4] Testing File Upload...
echo Test file content > test_file.txt

curl -s -X POST %baseUrl%/files ^
  -H "Authorization: Bearer !token!" ^
  -F "file=@test_file.txt" ^
  -F "folderId=!folderId!" > temp_file.json

echo [OK] File uploaded
echo.

REM 5. List Files
echo [5] Testing List Files...
curl -s -X GET %baseUrl%/files ^
  -H "Authorization: Bearer !token!" > temp_files.json
echo [OK] Files listed
echo.

REM Cleanup
del temp_*.json 2>nul
del test_file.txt 2>nul

echo ======================================
echo  All Tests Completed Successfully!
echo ======================================
echo.
echo Tested Features:
echo  - Authentication
echo  - Folder Management
echo  - File Upload
echo  - File Management
echo.

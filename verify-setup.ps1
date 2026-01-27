# File Sharing Project - Setup Verification Script
# Run: .\verify-setup.ps1

Write-Host "`n=== File Sharing Project - Verification Script ===" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Check 1: PostgreSQL Service
Write-Host "`n[1/7] Checking PostgreSQL Service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "[OK] PostgreSQL service is running" -ForegroundColor Green
    } else {
        Write-Host "[WARN] PostgreSQL service is stopped. Starting..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Write-Host "[OK] PostgreSQL service started" -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] PostgreSQL service not found" -ForegroundColor Red
    Write-Host "        Please install PostgreSQL first" -ForegroundColor Red
}

# Check 2: Backend .env file
Write-Host "`n[2/7] Checking Backend Configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "[OK] backend\.env file exists" -ForegroundColor Green
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "DB_CONNECTION=pg") {
        Write-Host "[OK] Database connection configured" -ForegroundColor Green
    }
    if ($envContent -match "PG_DB_NAME=db_magang") {
        Write-Host "[OK] Database name: db_magang" -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] backend\.env file not found" -ForegroundColor Red
}

# Check 3: Frontend .env file
Write-Host "`n[3/7] Checking Frontend Configuration..." -ForegroundColor Yellow
if (Test-Path "frontend\.env") {
    Write-Host "[OK] frontend\.env file exists" -ForegroundColor Green
}
if (Test-Path "frontend\.env.local") {
    Write-Host "[OK] frontend\.env.local file exists" -ForegroundColor Green
}

# Check 4: Backend node_modules
Write-Host "`n[4/7] Checking Backend Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    $backendModules = (Get-ChildItem "backend\node_modules" -Directory).Count
    Write-Host "[OK] Backend dependencies installed: $backendModules packages" -ForegroundColor Green
} else {
    Write-Host "[WARN] Backend dependencies not installed" -ForegroundColor Yellow
    Write-Host "       Run: cd backend; npm install" -ForegroundColor Yellow
}

# Check 5: Frontend node_modules
Write-Host "`n[5/7] Checking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    $frontendModules = (Get-ChildItem "frontend\node_modules" -Directory).Count
    Write-Host "[OK] Frontend dependencies installed: $frontendModules packages" -ForegroundColor Green
} else {
    Write-Host "[WARN] Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "       Run: cd frontend; npm install" -ForegroundColor Yellow
}

# Check 6: Port availability
Write-Host "`n[6/7] Checking Port Availability..." -ForegroundColor Yellow
$port3333 = Get-NetTCPConnection -LocalPort 3333 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port3333) {
    Write-Host "[WARN] Port 3333 is already in use (Backend)" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Port 3333 is available (Backend)" -ForegroundColor Green
}

if ($port3000) {
    Write-Host "[WARN] Port 3000 is already in use (Frontend)" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Port 3000 is available (Frontend)" -ForegroundColor Green
}

# Check 7: Database migrations
Write-Host "`n[7/7] Checking Database Migrations..." -ForegroundColor Yellow
$migrationFiles = (Get-ChildItem "backend\database\migrations\*.ts").Count
Write-Host "[OK] Found $migrationFiles migration files" -ForegroundColor Green

# Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor White
Write-Host "2. Create database if not exists: CREATE DATABASE db_magang;" -ForegroundColor White
Write-Host "3. Install dependencies if needed:" -ForegroundColor White
Write-Host "   cd backend; npm install" -ForegroundColor Gray
Write-Host "   cd frontend; npm install" -ForegroundColor Gray
Write-Host "4. Run migrations:" -ForegroundColor White
Write-Host "   cd backend; node ace migration:run" -ForegroundColor Gray
Write-Host "5. Start servers:" -ForegroundColor White
Write-Host "   Terminal 1: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "   Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray

Write-Host "`nFor detailed fixes, see: FIX_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""

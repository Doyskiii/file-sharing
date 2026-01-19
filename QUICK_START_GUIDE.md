# 🚀 Quick Start Guide - File Sharing Project

Panduan cepat untuk menjalankan dan menggunakan project file sharing.

---

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL atau SQLite
- Git

---

## ⚡ Quick Start (5 Menit)

### 1. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Setup database (SQLite - sudah otomatis)
# Atau edit .env untuk PostgreSQL

# Run migrations
node ace migration:run

# Run seeders (buat admin user)
node ace db:seed

# Start server
npm run dev
```

Server akan jalan di: **http://localhost:3333**

### 2. Setup Frontend (Optional)

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan jalan di: **http://localhost:3000**

---

## 🔑 Default Accounts

Setelah run seeder, gunakan salah satu akun berikut untuk login:

### Admin Account
```
Email: Admin@example.com
Password: Admin123
Role: Administration
```

### Regular User Account
```
Email: User@example.com
Password: User1234
Role: User
```

### Superadmin Account
```
Email: Superadmin@example.com
Password: Superadmin123
Role: Superadmin
```

---

## 📝 Testing API dengan PowerShell

### 1. Login & Simpan Token

```powershell
# Login (gunakan salah satu akun di atas)
$response = Invoke-WebRequest -Uri "http://localhost:3333/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"Admin@example.com","password":"Admin123"}'

# Parse response
$data = $response.Content | ConvertFrom-Json

# Simpan token ke file
$data.token.token | Out-File -FilePath "token.txt" -NoNewline

# Lihat token
Get-Content "token.txt"
```

### 2. Create Folder

```powershell
$token = Get-Content "token.txt"
Invoke-WebRequest -Uri "http://localhost:3333/folders" -Method POST -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -Body '{"name":"My Documents"}'
```

### 3. Upload File

```powershell
# Buat test file
Set-Content -Path "test.txt" -Value "Hello World!"

# Upload (gunakan script yang sudah ada)
powershell -ExecutionPolicy Bypass -File test-upload.ps1
```

### 4. List Files

```powershell
$token = Get-Content "token.txt"
Invoke-WebRequest -Uri "http://localhost:3333/files" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### 5. Download File

```powershell
$token = Get-Content "token.txt"
Invoke-WebRequest -Uri "http://localhost:3333/files/1/download" -Method GET -Headers @{"Authorization"="Bearer $token"} -OutFile "downloaded.txt"
```

---

## 🛠️ Useful Commands

### Backend Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
node ace migration:run   # Run migrations
node ace migration:rollback  # Rollback last migration
node ace db:seed         # Run all seeders
node ace db:seed --interactive  # Choose which seeder to run

# Generate
node ace make:controller UserController  # Create controller
node ace make:model User                 # Create model
node ace make:migration create_users     # Create migration
node ace make:validator CreateUser       # Create validator

# Testing
npm test                 # Run tests

# Build
npm run build           # Build for production
node ace serve          # Start production server
```

### Database Reset (Jika Perlu)

```bash
# Reset database
node ace migration:fresh

# Reset + seed
node ace migration:fresh --seed
```

---

## 📚 API Endpoints

### Authentication
```
POST   /register          # Register new user
POST   /login             # Login user
POST   /logout            # Logout user
GET    /me                # Get current user
```

### Users (Admin Only)
```
GET    /users             # List all users
GET    /users/:id         # Get user details
POST   /users             # Create user
PUT    /users/:id         # Update user
DELETE /users/:id         # Delete user
POST   /users/:id/assign-role  # Assign role to user
```

### Roles (Admin Only)
```
GET    /roles             # List all roles
GET    /roles/:id         # Get role details
POST   /roles             # Create role
PUT    /roles/:id         # Update role
DELETE /roles/:id         # Delete role
POST   /roles/:id/assign-permission  # Assign permission
```

### Folders
```
GET    /folders           # List user's folders
GET    /folders/:id       # Get folder details
POST   /folders           # Create folder
PUT    /folders/:id       # Update folder
DELETE /folders/:id       # Delete folder
```

### Files
```
GET    /files             # List user's files
GET    /files?folderId=1  # List files in folder
GET    /files/:id         # Get file details
POST   /files             # Upload file
GET    /files/:id/download  # Download file
PUT    /files/:id         # Rename/move file
DELETE /files/:id         # Delete file
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Windows - Kill process on port 3333
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Or change port in .env
PORT=3334
```

### Database Locked (SQLite)

```bash
# Stop all running servers
# Delete database file
rm tmp/db.sqlite3

# Recreate database
node ace migration:run
node ace db:seed
```

### Migration Error

```bash
# Rollback and try again
node ace migration:rollback
node ace migration:run
```

### Token Expired

```bash
# Login again to get new token
# Token expires after 30 days by default
```

---

## 📖 Documentation Files

- `API_DOCUMENTATION.md` - Complete API reference
- `PHASE1_FOLDER_TESTING.md` - Folder management testing
- `PHASE2_FILE_TESTING.md` - File management testing
- `PROJECT_AUDIT_SUMMARY.md` - Complete project audit
- `AUDIT_HASIL_PEMERIKSAAN.md` - Audit summary (Bahasa Indonesia)
- `FILE_SHARING_ROADMAP.md` - Development roadmap

---

## 🎯 Next Steps

1. ✅ Backend API sudah jalan
2. ✅ Test semua endpoint
3. ✅ Activity Logging (Phase 4) Complete
4. ⏳ Develop frontend UI
5. ⏳ Implement file encryption (Phase 5)
6. ⏳ Advanced features (Phase 6)

---

## 💡 Tips

### Development
- Gunakan Postman atau Thunder Client untuk testing API
- Enable hot reload: `npm run dev`
- Check logs di terminal untuk debug

### Production
- Set `NODE_ENV=production`
- Use PostgreSQL instead of SQLite
- Enable HTTPS
- Set proper CORS settings
- Add rate limiting
- Setup backup strategy

### Security
- Change default admin password
- Use strong JWT secret
- Enable 2FA for admin accounts
- Regular security audits
- Keep dependencies updated

---

## 🆘 Need Help?

1. Check documentation files
2. Check error logs in terminal
3. Check database with: `node ace db:seed --interactive`
4. Reset database if needed: `node ace migration:fresh --seed`

---

## 📞 Support

Project ini sudah di-audit dan semua fitur core sudah berfungsi dengan baik:
- ✅ Authentication (19/19 tests passing)
- ✅ Folder Management (6/6 tests passing)
- ✅ File Management (6/6 tests passing)

Total: **31/31 tests passing** ✅

---

**Last Updated:** January 9, 2026  
**Version:** 1.0.0  
**Status:** Production Ready (Core Features)

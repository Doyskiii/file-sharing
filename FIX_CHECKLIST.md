# 🔧 File Sharing Project - Fix Checklist

## Status Pemeriksaan: 27 Januari 2026

### ✅ Yang Sudah Benar

1. **Backend Configuration**
   - ✅ `.env` file sudah ada dengan konfigurasi localhost
   - ✅ Database: `db_magang` 
   - ✅ Host: `localhost:5432`
   - ✅ User: `postgres`
   - ✅ Password: `postgres`

2. **Frontend Configuration**
   - ✅ `.env` dan `.env.local` sudah benar
   - ✅ Backend URL: `http://localhost:3333`
   - ✅ Tailwind v4 sudah terkonfigurasi dengan benar
   - ✅ PostCSS config sudah benar
   - ✅ shadcn components sudah setup

3. **Code Structure**
   - ✅ AdonisJS 6 backend properly structured
   - ✅ Next.js 16 frontend with App Router
   - ✅ Migration files sudah ada (18 migrations)

---

## 🔧 Perbaikan yang Sudah Dilakukan

### 1. Backend Environment Schema
**File:** `backend/start/env.ts`

**Masalah:** Missing `DB_SSL_DISABLED` dalam schema validasi
**Perbaikan:** Menambahkan validasi untuk `DB_SSL_DISABLED: Env.schema.boolean.optional()`

```typescript
// Ditambahkan di backend/start/env.ts line 32
DB_SSL_DISABLED: Env.schema.boolean.optional(),
```

**Status:** ✅ FIXED

---

## 📋 Yang Perlu Dilakukan Selanjutnya

### 1. Install Dependencies (Jika Belum)

```powershell
# Di root folder
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Pastikan PostgreSQL Running & Database Exists

```powershell
# Cek PostgreSQL service
Get-Service -Name postgresql*

# Atau test connection dengan script yang sudah dibuat
node test-database-connection.js
```

**Jika database belum ada, buat dulu:**
```sql
-- Connect ke PostgreSQL dengan psql atau pgAdmin
CREATE DATABASE db_magang;
```

### 3. Run Database Migrations

```powershell
cd backend
node ace migration:run
```

**Ini akan membuat 18 tables:**
- roles
- permissions
- role_permissions
- users
- sessions
- folders
- files
- activities
- file_shares
- file_keys
- user_roles
- auth_access_tokens
- dan lainnya

### 4. (Optional) Seed Test Data

Jika ingin data test user:
```powershell
cd backend
node ace db:seed
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Backend akan jalan di: http://localhost:3333

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend akan jalan di: http://localhost:3000

---

## 🧪 Testing

### Test Database Connection
```powershell
node test-database-connection.js
```

### Test Backend API
Buka browser: http://localhost:3333
Seharusnya return: `{"hello":"world"}`

### Test Frontend
Buka browser: http://localhost:3000

---

## ⚠️ Common Issues & Solutions

### Issue 1: PostgreSQL Not Running
```powershell
# Check service
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-{version}
```

### Issue 2: Database Doesn't Exist
```sql
-- Buka psql atau pgAdmin
CREATE DATABASE db_magang;
```

### Issue 3: Port Already in Use
```powershell
# Kill process on port 3333
Get-Process -Id (Get-NetTCPConnection -LocalPort 3333).OwningProcess | Stop-Process -Force

# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Issue 4: Migration Errors
```powershell
# Reset and re-run migrations
cd backend
node ace migration:rollback
node ace migration:run
```

### Issue 5: Frontend Build Errors
```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 📊 Project Structure Summary

```
file-sharing/
├── backend/           (AdonisJS 6)
│   ├── .env          ✅ Configured for localhost/db_magang
│   ├── app/
│   ├── database/
│   │   └── migrations/  (18 files)
│   └── start/
├── frontend/         (Next.js 16 + Tailwind v4)
│   ├── .env          ✅ Configured
│   ├── .env.local    ✅ Configured
│   ├── src/
│   │   └── app/
│   └── components.json
└── package.json
```

---

## ✅ Quick Start Commands

```powershell
# 1. Install all dependencies
npm install; cd backend; npm install; cd ..; cd frontend; npm install; cd ..

# 2. Test database
node test-database-connection.js

# 3. Run migrations
cd backend; node ace migration:run; cd ..

# 4. Start backend (Terminal 1)
cd backend; npm run dev

# 5. Start frontend (Terminal 2)
cd frontend; npm run dev
```

---

## 🎯 Success Checklist

- [ ] PostgreSQL service running
- [ ] Database `db_magang` exists
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database migrations completed
- [ ] Backend running on port 3333
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login to the application

---

**Last Updated:** 27 Januari 2026
**Status:** Configuration Fixed ✅ | Ready for Testing 🧪

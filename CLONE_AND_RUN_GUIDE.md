# 📋 CLONE & RUN INSTRUCTIONS FOR YOUR TEAM

## ✅ Ya, Bisa Langsung Jalan!

Ketika teman Anda clone repository, sebagian besar sudah siap. Tapi ada beberapa langkah kecil yang perlu.

---

## 🚀 LANGKAH-LANGKAH CLONE & RUN

### Step 1: Clone Repository
```bash
git clone https://github.com/Doyskiii/file-sharing.git
cd file-sharing
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 3: ✅ Database Connection (SUDAH SIAP!)

**Database credentials sudah ada di:**
```
backend/.env
```

**Informasi Database:**
```
Provider: Neon PostgreSQL Cloud
Host: ep-fancy-shadow-ae5sdgfg-pooler.c-2.us-east-2.aws.neon.tech
Database: db_magang
User: neondb_owner
Password: (sudah ter-set)
Port: 5432
Region: AWS us-east-2
```

**✅ DATABASE SUDAH TER-SETUP!** Tidak perlu setup ulang.

### Step 4: Frontend Environment (Perlu Buat)

Buat file `frontend/.env.local`:
```bash
# Di folder frontend/, buat file .env.local dengan isi:
```

File: `frontend/.env.local`
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

### Step 5: Run Backend
```bash
cd backend
npm run dev
# Akan run di http://localhost:3333
```

### Step 6: Run Frontend (Terminal Baru)
```bash
cd frontend
npm run dev
# Akan run di http://localhost:3000
```

### Step 7: Login dengan Test Account
```
Email: user@example.com
Password: password
```

---

## ✨ Apa yang SUDAH Siap:

| Item | Status | Detail |
|------|--------|--------|
| Database Connection | ✅ SIAP | Credentials di backend/.env |
| Backend Dependencies | ✅ SIAP | package.json sudah lengkap |
| Frontend Dependencies | ✅ SIAP | package.json sudah lengkap |
| Database Schema | ✅ SIAP | Sudah ada 12 tables |
| Database Data | ✅ SIAP | Test users sudah ter-seed |
| Test Accounts | ✅ SIAP | 4 akun ready pakai |
| API Endpoints | ✅ SIAP | 140+ endpoints ready |
| Frontend Pages | ✅ SIAP | Semua pages ready |

---

## ⚠️ Yang PERLU Diketahui:

### 1. Database Credentials
```
Database credentials ada di backend/.env
Jangan di-push ke GitHub jika credentials sensitive!
(Tapi untuk development/demo bisa)
```

### 2. Frontend Environment Variable
```
Setiap team member perlu buat frontend/.env.local:
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

### 3. Port Harus Bebas
```
Port 3333: Backend API
Port 3000: Frontend App

Pastikan tidak ada aplikasi lain yang pakai port ini.
```

---

## 📊 Quick Summary untuk Team

**Yang Teman Anda Perlu Lakukan:**

1. ✅ Clone repo
2. ✅ `npm install` di semua folder
3. ✅ Buat `frontend/.env.local` (HANYA 1 line)
4. ✅ `npm run dev` di backend
5. ✅ `npm run dev` di frontend (terminal baru)
6. ✅ Buka http://localhost:3000
7. ✅ Login dengan test account

**Waktu Setup:** ~5 menit

---

## 🔐 Test Accounts (Sudah Ready)

Gunakan salah satu akun ini untuk login:

```
Admin Account:
  Email: admin@example.com
  Password: password

User Account:
  Email: user@example.com
  Password: password

Project Manager Account:
  Email: ketuateam@example.com
  Password: password

Superadmin Account:
  Email: superadmin@example.com
  Password: password
```

---

## 🚨 Jika Ada Error:

### Error: Database Connection Failed
```
Solusi: Backend/.env sudah ada credentials
Pastikan:
1. Internet aktif (akses Neon Cloud)
2. Port 5432 tidak terblokir firewall
3. Neon account masih aktif
```

### Error: Port 3333 atau 3000 Sudah Digunakan
```
Solusi: Kill process yang menggunakan port:

Windows (PowerShell):
  Get-Process -Name node | Stop-Process -Force

Linux/Mac:
  lsof -ti:3333 | xargs kill -9
  lsof -ti:3000 | xargs kill -9
```

### Error: npm install gagal
```
Solusi: Bersihkan cache:
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
```

### Error: Frontend tidak bisa connect ke Backend
```
Solusi: Pastikan:
1. Backend sudah running (http://localhost:3333)
2. frontend/.env.local punya: NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
3. Tidak ada typo di URL
```

---

## 📚 Dokumentasi Tersedia

Di repository sudah ada dokumentasi lengkap:

```
- QUICK_START_30SEC.md      - Start dalam 30 detik
- APPLICATION_COMPLETE.md   - Feature complete list
- API_DOCUMENTATION.md      - Semua endpoints
- DEPLOYMENT_GUIDE.md       - Deploy ke production
```

---

## 🎯 Checklist Clone & Run

```
[ ] Clone repository
[ ] cd file-sharing
[ ] npm install (di root)
[ ] cd backend && npm install && cd ..
[ ] cd frontend && npm install && cd ..
[ ] Create frontend/.env.local dengan 1 line saja
[ ] Terminal 1: cd backend && npm run dev
[ ] Terminal 2: cd frontend && npm run dev
[ ] Buka http://localhost:3000
[ ] Login dengan user@example.com / password
[ ] ✅ SUCCESS!
```

---

## 🎊 Kesimpulannya:

### **YA, BISA LANGSUNG JALAN! ✅**

**Database:**
- ✅ Sudah connect ke Neon Cloud
- ✅ Credentials sudah di backend/.env
- ✅ 12 tables sudah jalan
- ✅ Test data sudah ada

**Backend:**
- ✅ Semua code siap
- ✅ Dependencies siap
- ✅ Migrations sudah applied
- ✅ Tinggal `npm run dev`

**Frontend:**
- ✅ Semua code siap
- ✅ Dependencies siap
- ✅ Tinggal buat 1 file `.env.local`
- ✅ Tinggal `npm run dev`

**Waktu Setup untuk Team:** 5-10 menit

---

*Generated: January 20, 2026*
*Status: Ready for Team Collaboration ✅*

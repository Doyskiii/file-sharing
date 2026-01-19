# Setup Instructions After Fixes

## 🚀 Langkah-langkah Setup

### 1. Install Dependencies (Jika Belum)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database

Pastikan PostgreSQL sudah berjalan dan buat database:

```sql
CREATE DATABASE db_magang;
```

### 3. Setup Environment Variables

Buat file `.env` di folder `backend/` jika belum ada:

```env
# Server
PORT=3333
HOST=0.0.0.0
NODE_ENV=development

# Database
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DB_NAME=db_magang

# App Key (generate dengan: node ace generate:key)
APP_KEY=your_app_key_here
```

### 4. Generate App Key (Jika Belum)

```bash
cd backend
node ace generate:key
```

Copy output dan paste ke `.env` file.

### 5. Rollback Migrations (Jika Sudah Pernah Run)

**PENTING:** Karena ada perubahan pada migrations, Anda perlu rollback dulu:

```bash
cd backend
node ace migration:rollback --batch=0
```

### 6. Run Migrations

```bash
node ace migration:run
```

Output yang diharapkan:
```
❯ Executed 1760412290589_create_roles_table
❯ Executed 1760413415474_create_permissions_table
❯ Executed 1760413657863_create_create_role_permissions_table
❯ Executed 1760425719789_create_users_table
❯ Executed 1760426738230_create_sessions_table
❯ Executed 1760427841871_create_folders_table
❯ Executed 1760428461560_create_files_table
❯ Executed 1760431068434_create_activities_table
❯ Executed 1760431962731_create_file_shares_table
❯ Executed 1760432253553_create_file_keys_table
❯ Executed 1767861086274_create_user_roles_table
❯ Executed 1767873138753_create_auth_access_tokens_table
```

### 7. Run Seeders

```bash
node ace db:seed
```

Ini akan membuat:
- Permissions (user:create, user:update, dll)
- Roles (Superadmin, Admin, User)
- Admin user dengan password yang sudah di-hash
- Role assignments

### 8. Start Development Server

**Backend:**
```bash
cd backend
npm run dev
```

Server akan berjalan di `http://localhost:3333`

**Frontend:**
```bash
cd frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

---

## 🧪 Testing Authentication

### 1. Test Register

**Endpoint:** `POST http://localhost:3333/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "isActive": true
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "isActive": true,
    "roles": [
      {
        "id": 3,
        "name": "User",
        "description": "Regular user"
      }
    ]
  },
  "token": "oat_xxx.yyy.zzz"
}
```

**Verifikasi:**
- Password di database harus ter-hash (bukan plain text)
- Token harus dalam format AdonisJS access token
- User otomatis mendapat role "User"

### 2. Test Login

**Endpoint:** `POST http://localhost:3333/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "isActive": true,
    "roles": [...]
  },
  "token": "oat_xxx.yyy.zzz"
}
```

**Verifikasi:**
- Login dengan password yang benar harus berhasil
- Login dengan password salah harus gagal (401)
- Token baru dibuat setiap login

### 3. Test Protected Route (Get Current User)

**Endpoint:** `GET http://localhost:3333/me`

**Headers:**
```
Authorization: Bearer oat_xxx.yyy.zzz
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "isActive": true,
    "roles": [...]
  }
}
```

**Verifikasi:**
- Dengan token valid: berhasil (200)
- Tanpa token: gagal (401)
- Dengan token invalid: gagal (401)

### 4. Test Logout

**Endpoint:** `POST http://localhost:3333/logout`

**Headers:**
```
Authorization: Bearer oat_xxx.yyy.zzz
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Verifikasi:**
- Token dihapus dari database
- Token yang sama tidak bisa digunakan lagi

### 5. Test Admin Routes

**Login sebagai Admin:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Test Get All Users:**
```
GET http://localhost:3333/users
Authorization: Bearer {admin_token}
```

**Expected:** Berhasil (200) dengan list users

**Test dengan User biasa:**
```
GET http://localhost:3333/users
Authorization: Bearer {user_token}
```

**Expected:** Gagal (403) karena bukan Superadmin

---

## 🔍 Verifikasi Database

### Check Password Hashing

```sql
SELECT id, email, password FROM users;
```

Password harus dalam format hash, contoh:
```
$scrypt$n=16384,r=8,p=1$xxxxxxxxxxxxx$yyyyyyyyyyyyyyyy
```

**BUKAN** plain text seperti: `password123`

### Check Access Tokens

```sql
SELECT * FROM auth_access_tokens;
```

Setiap login harus membuat entry baru dengan:
- `tokenable_id`: user ID
- `type`: 'auth_token'
- `hash`: hashed token
- `expires_at`: 7 hari dari created_at

### Check User Roles

```sql
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;
```

---

## 🐛 Troubleshooting

### Error: "Invalid credentials" saat login

**Penyebab:** Password di database masih plain text (dari sebelum fix)

**Solusi:**
1. Rollback migrations: `node ace migration:rollback --batch=0`
2. Run migrations lagi: `node ace migration:run`
3. Run seeders: `node ace db:seed`

### Error: "User not found" atau "Unauthenticated"

**Penyebab:** Token tidak valid atau sudah expired

**Solusi:**
1. Login ulang untuk mendapat token baru
2. Pastikan header Authorization format: `Bearer {token}`
3. Check token di database masih ada dan belum expired

### Error: Migration sudah dijalankan

**Solusi:**
```bash
# Rollback semua migrations
node ace migration:rollback --batch=0

# Run migrations lagi
node ace migration:run
```

### Error: TypeScript errors

**Solusi:**
```bash
cd backend
npm install
npm run typecheck
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login user |
| POST | `/logout` | Yes | Logout user |
| GET | `/me` | Yes | Get current user |

### User Management (Superadmin Only)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/users` | Yes (Superadmin) | Get all users |
| GET | `/users/:id` | Yes (Superadmin) | Get user by ID |
| POST | `/users` | Yes (Superadmin) | Create new user |
| PUT | `/users/:id` | Yes (Superadmin) | Update user |
| DELETE | `/users/:id` | Yes (Superadmin) | Delete user |
| POST | `/users/:id/assign-role` | Yes (Superadmin + Permission) | Assign role to user |

### Role Management (Superadmin Only)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/roles` | Yes (Superadmin) | Get all roles |
| GET | `/roles/:id` | Yes (Superadmin) | Get role by ID |
| POST | `/roles` | Yes (Superadmin) | Create new role |
| PUT | `/roles/:id` | Yes (Superadmin) | Update role |
| DELETE | `/roles/:id` | Yes (Superadmin) | Delete role |
| POST | `/roles/:id/assign-permission` | Yes (Superadmin) | Assign permission to role |

### Permission Management (Superadmin Only)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/permissions` | Yes (Superadmin) | Get all permissions |

---

## ✅ Checklist Setelah Setup

- [ ] Database migrations berhasil dijalankan
- [ ] Seeders berhasil dijalankan
- [ ] Backend server berjalan tanpa error
- [ ] Frontend server berjalan tanpa error
- [ ] Register user baru berhasil
- [ ] Password ter-hash di database
- [ ] Login berhasil dengan password yang benar
- [ ] Token dikembalikan dalam format yang benar
- [ ] Protected routes bisa diakses dengan token
- [ ] Logout berhasil dan token dihapus
- [ ] Admin routes hanya bisa diakses oleh Superadmin

---

## 📞 Support

Jika ada masalah atau pertanyaan, silakan:
1. Check CHANGELOG_FIXES.md untuk detail perubahan
2. Check FIXES_TODO.md untuk progress tracking
3. Review error logs di terminal
4. Check database untuk verifikasi data

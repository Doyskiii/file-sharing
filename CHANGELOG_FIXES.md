# Changelog - File Sharing Project Fixes

## Tanggal: 2024

### 🔧 Perbaikan yang Dilakukan

#### 1. **Pembersihan Migration Files Duplikat**

**Masalah:**
- Terdapat 2 migration files untuk tabel `user_roles`
- Terdapat 3 migration files untuk tabel `auth_access_tokens`
- Salah satu migration file memiliki komentar Windsurf yang tidak valid

**Solusi:**
- ✅ Menghapus `1760433000000_create_user_roles_table.ts` (duplikat lama)
- ✅ Menghapus `1766464770232_create_access_tokens_table.ts` (duplikat lama)
- ✅ Menghapus `1767872430944_create_auth_access_tokens_table.ts` (duplikat)
- ✅ Memperbaiki `1767873138753_create_auth_access_tokens_table.ts` (menghapus komentar invalid)

**File yang Tersisa:**
- `1767861086274_create_user_roles_table.ts` - Migration terbaru untuk user_roles
- `1767873138753_create_auth_access_tokens_table.ts` - Migration terbaru untuk auth_access_tokens

---

#### 2. **Perbaikan Konfigurasi Authentication**

**Masalah:**
- `backend/config/auth.ts` masih menggunakan path ke model lama: `../original/app/models/user.js`
- User model aktif tidak memiliki `accessTokens` provider yang dibutuhkan

**Solusi:**
- ✅ Update `backend/config/auth.ts`:
  ```typescript
  // Sebelum:
  model: () => import('../original/app/models/user.js')
  
  // Sesudah:
  model: () => import('#models/user')
  ```

- ✅ Menambahkan `accessTokens` provider ke `backend/app/models/user.ts`:
  ```typescript
  import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
  
  export default class User extends AuthFinder(BaseModel) {
    static accessTokens = DbAccessTokensProvider.forModel(User)
    // ... rest of the model
  }
  ```

---

#### 3. **Implementasi Password Hashing yang Benar**

**Masalah:**
- Password disimpan dan dibandingkan sebagai **plain text** di `auth_controller.ts`
- Ini adalah masalah keamanan yang sangat serius

**Solusi:**
- ✅ Update `backend/app/controllers/auth_controller.ts`:

**Login Method:**
```typescript
// Sebelum:
if (user.password !== password) {
  return response.unauthorized({ message: 'Invalid credentials' })
}
const token = `token_${user.id}_${Date.now()}`

// Sesudah:
const user = await User.verifyCredentials(email, password)
const token = await User.accessTokens.create(user, ['*'], {
  expiresIn: '7 days',
})
return response.ok({
  message: 'Login successful',
  user: user,
  token: token.value!.release(),
})
```

**Register Method:**
```typescript
// Sebelum:
const user = await User.create(payload)
const token = `token_${user.id}_${Date.now()}`

// Sesudah:
const hashedPassword = await hash.make(payload.password)
const user = await User.create({
  ...payload,
  password: hashedPassword,
})
const token = await User.accessTokens.create(user, ['*'], {
  expiresIn: '7 days',
})
```

**Logout Method:**
```typescript
// Sebelum:
async logout({ response }: HttpContext) {
  return response.ok({ message: 'Logged out successfully' })
}

// Sesudah:
async logout({ auth, response }: HttpContext) {
  const user = auth.getUserOrFail()
  await User.accessTokens.delete(user, user.currentAccessToken.identifier)
  return response.ok({ message: 'Logged out successfully' })
}
```

**Me Method:**
```typescript
// Sebelum:
const user = (response.ctx as any).user

// Sesudah:
const user = auth.getUserOrFail()
```

---

#### 4. **Update Authentication Middleware**

**Masalah:**
- Custom auth middleware menggunakan implementasi sederhana dengan token format `token_${userId}_${timestamp}`
- Tidak menggunakan AdonisJS auth system yang proper

**Solusi:**
- ✅ Update `backend/app/middleware/auth_middleware.ts`:

```typescript
// Sebelum: Custom token parsing
async handle(ctx: HttpContext, next: NextFn) {
  const authHeader = ctx.request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ctx.response.unauthorized({ message: 'Authentication required' })
  }
  const token = authHeader.substring(7)
  // ... manual token parsing
}

// Sesudah: Menggunakan AdonisJS auth
async handle(
  ctx: HttpContext,
  next: NextFn,
  options: {
    guards?: (keyof Authenticators)[]
  } = {}
) {
  await ctx.auth.authenticateUsing(options.guards || [ctx.auth.defaultGuard])
  return next()
}
```

---

#### 5. **Update Routes Configuration**

**Solusi:**
- ✅ Update `backend/start/routes.ts` untuk menggunakan proper auth middleware:

```typescript
// Auth routes dengan guard specification
router
  .post('/logout', '#controllers/auth_controller.logout')
  .use(middleware.auth({ guards: ['api'] }))
  
router
  .get('/me', '#controllers/auth_controller.me')
  .use(middleware.auth({ guards: ['api'] }))

// Protected routes
router
  .group(() => {
    // ... user routes
  })
  .use([middleware.auth({ guards: ['api'] }), middleware.is({ role: 'Superadmin' })])
```

---

### 📋 Ringkasan Perubahan File

**Files Deleted:**
1. `backend/database/migrations/1760433000000_create_user_roles_table.ts`
2. `backend/database/migrations/1766464770232_create_access_tokens_table.ts`
3. `backend/database/migrations/1767872430944_create_auth_access_tokens_table.ts`

**Files Modified:**
1. `backend/database/migrations/1767873138753_create_auth_access_tokens_table.ts`
2. `backend/config/auth.ts`
3. `backend/app/models/user.ts`
4. `backend/app/controllers/auth_controller.ts`
5. `backend/app/middleware/auth_middleware.ts`
6. `backend/start/routes.ts`

**Files Created:**
1. `FIXES_TODO.md` - Progress tracking
2. `CHANGELOG_FIXES.md` - Dokumentasi perubahan (file ini)

---

### 🔐 Keamanan yang Ditingkatkan

1. **Password Hashing**: Password sekarang di-hash menggunakan scrypt sebelum disimpan
2. **Token Management**: Menggunakan AdonisJS access tokens yang lebih aman
3. **Token Expiration**: Token sekarang memiliki expiration time (7 hari)
4. **Proper Logout**: Token dihapus dari database saat logout

---

### ⚠️ Breaking Changes

**PENTING:** Jika Anda sudah memiliki user di database dengan password plain text, Anda perlu:

1. **Rollback migrations** (jika sudah dijalankan):
   ```bash
   cd backend
   node ace migration:rollback
   ```

2. **Re-run migrations**:
   ```bash
   node ace migration:run
   ```

3. **Run seeders** untuk membuat user baru dengan password yang sudah di-hash:
   ```bash
   node ace db:seed
   ```

4. **Atau gunakan command** `hash_existing_passwords` jika ada (untuk hash password yang sudah ada):
   ```bash
   node ace hash:passwords
   ```

---

### 🧪 Testing yang Diperlukan

Setelah perubahan ini, Anda perlu test:

1. ✅ **Register**: POST `/register`
   - Pastikan password di-hash di database
   - Pastikan token dikembalikan dengan format yang benar

2. ✅ **Login**: POST `/login`
   - Pastikan bisa login dengan password yang benar
   - Pastikan token dikembalikan

3. ✅ **Protected Routes**: GET `/me`
   - Pastikan bisa akses dengan token yang valid
   - Pastikan ditolak tanpa token

4. ✅ **Logout**: POST `/logout`
   - Pastikan token dihapus dari database

5. ✅ **Role-based Access**:
   - Test routes yang memerlukan role Superadmin
   - Test permission middleware

---

### 📝 Catatan Tambahan

- Folder `backend/original/` masih ada dan berisi model User lama
- Pertimbangkan untuk menghapus atau mendokumentasikan folder ini
- Semua endpoint sekarang menggunakan proper AdonisJS authentication
- Token format berubah dari `token_${userId}_${timestamp}` ke AdonisJS access token format

---

### 🎯 Next Steps

1. Test semua endpoint authentication
2. Verify password hashing bekerja dengan benar
3. Test role dan permission middleware
4. Update dokumentasi API jika diperlukan
5. Pertimbangkan untuk menambahkan refresh token mechanism
6. Setup proper error handling untuk authentication failures

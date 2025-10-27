# Tutorial Testing API dengan Postman

## Pendahuluan
Tutorial ini akan memandu Anda untuk menguji API AdonisJS menggunakan Postman. API ini memiliki sistem autentikasi dan role-based access control (RBAC) dengan endpoint untuk manajemen user, role, dan permission.

## Prerequisites
- Postman terinstall di komputer Anda
- Server API berjalan di `http://localhost:55652` (jalankan `npm run dev` jika belum)
- Database sudah di-seed dengan data awal

## Setup Postman
1. Buka Postman
2. Buat **New Collection** dengan nama "Republikorp API"
3. Buat **Environment** baru:
   - Name: "Local API"
   - Variable: `base_url` = `http://localhost:55652`
   - Variable: `token` = (kosongkan dulu, akan diisi nanti)

## 1. Test Endpoint Dasar

### GET Root Endpoint
- **Method**: GET
- **URL**: `{{base_url}}/`
- **Expected Response**: `{"hello":"world"}`

## 2. Authentikasi

### Register User Baru
- **Method**: POST
- **URL**: `{{base_url}}/auth/register`
- **Headers**:
  - Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
- **Expected Response**: User berhasil dibuat dengan token

### Login Admin
- **Method**: POST
- **URL**: `{{base_url}}/auth/login`
- **Headers**:
  - Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- **Expected Response**: Login berhasil, simpan token ke environment variable
- **Post-response Script** (untuk menyimpan token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
}
```

### Get Current User Info
- **Method**: GET
- **URL**: `{{base_url}}/auth/me`
- **Headers**:
  - Authorization: Bearer {{token}}
- **Expected Response**: Info user dengan roles

## 3. User Management (Superadmin Only)

### Get All Users
- **Method**: GET
- **URL**: `{{base_url}}/users`
- **Headers**:
  - Authorization: Bearer {{token}}
- **Expected Response**: Array of users dengan roles mereka

### Create New User
- **Method**: POST
- **URL**: `{{base_url}}/users`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "isActive": true
}
```

### Get User by ID
- **Method**: GET
- **URL**: `{{base_url}}/users/{id}` (ganti {id} dengan ID user)
- **Headers**:
  - Authorization: Bearer {{token}}

### Update User
- **Method**: PUT
- **URL**: `{{base_url}}/users/{id}`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "isActive": true
}
```

### Assign Role to User
- **Method**: POST
- **URL**: `{{base_url}}/users/{user_id}/assign-role`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "roleId": 2
}
```

### Delete User
- **Method**: DELETE
- **URL**: `{{base_url}}/users/{id}`
- **Headers**:
  - Authorization: Bearer {{token}}

## 4. Role Management (Superadmin Only)

### Get All Roles
- **Method**: GET
- **URL**: `{{base_url}}/roles`
- **Headers**:
  - Authorization: Bearer {{token}}
- **Expected Response**: Array of roles dengan permissions

### Get Role by ID
- **Method**: GET
- **URL**: `{{base_url}}/roles/{id}`
- **Headers**:
  - Authorization: Bearer {{token}}

### Create New Role
- **Method**: POST
- **URL**: `{{base_url}}/roles`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "name": "Manager",
  "description": "Department Manager"
}
```

### Update Role
- **Method**: PUT
- **URL**: `{{base_url}}/roles/{id}`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "name": "Senior Manager",
  "description": "Senior Department Manager"
}
```

### Assign Permission to Role
- **Method**: POST
- **URL**: `{{base_url}}/roles/{role_id}/assign-permission`
- **Headers**:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body**:
```json
{
  "permissionId": 1
}
```

### Delete Role
- **Method**: DELETE
- **URL**: `{{base_url}}/roles/{id}`
- **Headers**:
  - Authorization: Bearer {{token}}

## 5. Permission Management (Superadmin Only)

### Get All Permissions
- **Method**: GET
- **URL**: `{{base_url}}/permissions`
- **Headers**:
  - Authorization: Bearer {{token}}
- **Expected Response**: Array of all permissions

## Tips Testing

### Error Codes yang Mungkin Ditemui:
- **401 Unauthorized**: Token tidak valid atau tidak ada
- **403 Forbidden**: User tidak memiliki role/permission yang diperlukan
- **404 Not Found**: Endpoint atau resource tidak ditemukan
- **422 Validation Error**: Data yang dikirim tidak valid
- **500 Internal Server Error**: Error server-side

### Testing Scenarios:
1. **Test tanpa authentication**: Coba akses endpoint protected tanpa header Authorization
2. **Test dengan role yang salah**: Login sebagai user biasa (bukan Superadmin) dan coba akses endpoint Superadmin
3. **Test validation**: Kirim data yang tidak lengkap atau tidak valid
4. **Test CRUD flow**: Create → Read → Update → Delete untuk users dan roles

### Environment Variables:
- Pastikan `token` selalu ter-update setelah login
- Gunakan `base_url` untuk fleksibilitas jika port berubah

### Collection Runner:
- Anda bisa menggunakan Postman Collection Runner untuk menjalankan semua request secara otomatis
- Pastikan urutan request benar (login dulu sebelum request yang butuh auth)

## Troubleshooting

### Jika login admin gagal:
1. Pastikan database sudah di-seed: `node ace db:seed`
2. Cek apakah user admin sudah ada di database
3. Pastikan password benar: "password123"

### Jika endpoint protected mengembalikan 403:
1. Pastikan user memiliki role "Superadmin"
2. Cek di endpoint `/auth/me` apakah roles sudah ter-assign
3. Jalankan seeder assign role: `node ace db:seed --files=database/seeders/assign_admin_role_seeder.ts`

### Jika server tidak merespons:
1. Pastikan server berjalan: `npm run dev`
2. Cek port yang digunakan (default: 55652)
3. Update `base_url` di environment jika port berbeda

Selamat testing! 🚀

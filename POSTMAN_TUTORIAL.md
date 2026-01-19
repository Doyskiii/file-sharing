# 🧪 **Tutorial Testing API dengan Postman - File Sharing Application**

## 📋 **Pendahuluan**
Tutorial lengkap untuk testing API File Sharing menggunakan Postman. API ini memiliki fitur lengkap: Authentication, Folder Management, File Management, File Sharing, dan Activity Logging.

## 🔧 **Prerequisites**
- ✅ Postman terinstall
- ✅ Backend server running: `cd backend && npm run dev`
- ✅ Database seeded: `node ace db:seed`
- ✅ Server berjalan di `http://localhost:3333` atau port yang ditampilkan (cek terminal)

## ⚙️ **Setup Postman**

### **1. Buat Collection**
- Name: "File Sharing API"
- Description: "Complete API testing for file sharing application"

### **2. Buat Environment**
- Name: "Local Development"
- Variables:
- `base_url`: `http://localhost:52280` (ubah sesuai port yang ditampilkan di terminal)
  - `token`: (kosong dulu, akan diisi setelah login)
  - `user_id`: (untuk testing)
  - `file_id`: (untuk testing)
  - `folder_id`: (untuk testing)

---

## 🔐 **1. AUTHENTICATION TESTING**

### **POST /register - Register User Baru**
```
Method: POST
URL: {{base_url}}/register
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### **POST /login - Login**
```
Method: POST
URL: {{base_url}}/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@mail.com",
  "password": "admin123"
}
```

**Post-Response Script:**
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json();
    pm.environment.set("token", data.token.token);
    pm.environment.set("user_id", data.user.id);
}
```

### **GET /me - Get Current User**
```
Method: GET
URL: {{base_url}}/me
Headers:
  Authorization: Bearer {{token}}
```

### **POST /logout - Logout**
```
Method: POST
URL: {{base_url}}/logout
Headers:
  Authorization: Bearer {{token}}
```

---

## 📁 **2. FOLDER MANAGEMENT TESTING**

### **GET /folders - List Folders**
```
Method: GET
URL: {{base_url}}/folders
Headers:
  Authorization: Bearer {{token}}
```

### **POST /folders - Create Folder**
```
Method: POST
URL: {{base_url}}/folders
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "My Documents",
  "parentId": null
}
```

**Post-Response Script:**
```javascript
if (pm.response.code === 201) {
    const folder = pm.response.json();
    pm.environment.set("folder_id", folder.id);
}
```

### **GET /folders/{id} - Get Folder Details**
```
Method: GET
URL: {{base_url}}/folders/{{folder_id}}
Headers:
  Authorization: Bearer {{token}}
```

### **PUT /folders/{id} - Update Folder**
```
Method: PUT
URL: {{base_url}}/folders/{{folder_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Updated Documents"
}
```

### **DELETE /folders/{id} - Delete Folder**
```
Method: DELETE
URL: {{base_url}}/folders/{{folder_id}}
Headers:
  Authorization: Bearer {{token}}
```

---

## 📄 **3. FILE MANAGEMENT TESTING**

### **GET /files - List Files**
```
Method: GET
URL: {{base_url}}/files
Headers:
  Authorization: Bearer {{token}}
```

### **POST /files - Upload File**
```
Method: POST
URL: {{base_url}}/files
Headers:
  Authorization: Bearer {{token}}

Body: form-data
  file: [Select a file from your computer]
  folderId: {{folder_id}} (optional)
```

**Post-Response Script:**
```javascript
if (pm.response.code === 201) {
    const file = pm.response.json();
    pm.environment.set("file_id", file.id);
}
```

### **GET /files/{id} - Get File Details**
```
Method: GET
URL: {{base_url}}/files/{{file_id}}
Headers:
  Authorization: Bearer {{token}}
```

### **GET /files/{id}/download - Download File**
```
Method: GET
URL: {{base_url}}/files/{{file_id}}/download
Headers:
  Authorization: Bearer {{token}}
```

### **PUT /files/{id} - Update File**
```
Method: PUT
URL: {{base_url}}/files/{{file_id}}
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Updated File Name.txt"
}
```

### **DELETE /files/{id} - Delete File**
```
Method: DELETE
URL: {{base_url}}/files/{{file_id}}
Headers:
  Authorization: Bearer {{token}}
```

---

## 🔗 **4. FILE SHARING TESTING**

### **POST /files/{id}/share - Share with User**
```
Method: POST
URL: {{base_url}}/files/{{file_id}}/share
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "sharedWithId": 2,
  "accessType": "download",
  "expiredAt": "2027-12-31T23:59:59Z"
}
```

### **POST /files/{id}/share/public - Create Public Share**
```
Method: POST
URL: {{base_url}}/files/{{file_id}}/share/public
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "accessType": "view",
  "expiredAt": "2027-12-31T23:59:59Z"
}
```

**Post-Response Script:**
```javascript
if (pm.response.code === 201) {
    const share = pm.response.json();
    pm.environment.set("public_token", share.token);
}
```

### **GET /shares/public/{token} - Access Public Share**
```
Method: GET
URL: {{base_url}}/shares/public/{{public_token}}
```

### **GET /files/shares/received - List Received Shares**
```
Method: GET
URL: {{base_url}}/files/shares/received
Headers:
  Authorization: Bearer {{token}}
```

### **GET /files/shares/sent - List Sent Shares**
```
Method: GET
URL: {{base_url}}/files/shares/sent
Headers:
  Authorization: Bearer {{token}}
```

### **PUT /files/shares/{id} - Update Share**
```
Method: PUT
URL: {{base_url}}/files/shares/1
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "accessType": "view"
}
```

### **DELETE /files/shares/{id} - Revoke Share**
```
Method: DELETE
URL: {{base_url}}/files/shares/1
Headers:
  Authorization: Bearer {{token}}
```

---

## 📊 **5. ACTIVITY LOGGING TESTING**

### **GET /activities/me - My Activities**
```
Method: GET
URL: {{base_url}}/activities/me?page=1&limit=10
Headers:
  Authorization: Bearer {{token}}
```

### **GET /activities/stats/me - My Statistics**
```
Method: GET
URL: {{base_url}}/activities/stats/me
Headers:
  Authorization: Bearer {{token}}
```

### **GET /activities - All Activities (Admin Only)**
```
Method: GET
URL: {{base_url}}/activities?page=1&limit=10&action=auth:login
Headers:
  Authorization: Bearer {{token}}
```

### **GET /activities/stats - Global Statistics (Admin Only)**
```
Method: GET
URL: {{base_url}}/activities/stats
Headers:
  Authorization: Bearer {{token}}
```

### **GET /activities/file/{id} - File Activities**
```
Method: GET
URL: {{base_url}}/activities/file/{{file_id}}
Headers:
  Authorization: Bearer {{token}}
```

---

## 👥 **6. USER MANAGEMENT TESTING (Admin Only)**

### **GET /users - List All Users**
```
Method: GET
URL: {{base_url}}/users
Headers:
  Authorization: Bearer {{token}}
```

### **GET /users/{id} - Get User Details**
```
Method: GET
URL: {{base_url}}/users/2
Headers:
  Authorization: Bearer {{token}}
```

### **POST /users - Create User**
```
Method: POST
URL: {{base_url}}/users
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### **PUT /users/{id} - Update User**
```
Method: PUT
URL: {{base_url}}/users/2
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "username": "updateduser"
}
```

### **DELETE /users/{id} - Delete User**
```
Method: DELETE
URL: {{base_url}}/users/2
Headers:
  Authorization: Bearer {{token}}
```

### **POST /users/{id}/assign-role - Assign Role**
```
Method: POST
URL: {{base_url}}/users/2/assign-role
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "roleId": 2
}
```

---

## 🎯 **7. ROLE MANAGEMENT TESTING (Admin Only)**

### **GET /roles - List Roles**
```
Method: GET
URL: {{base_url}}/roles
Headers:
  Authorization: Bearer {{token}}
```

### **GET /roles/{id} - Get Role Details**
```
Method: GET
URL: {{base_url}}/roles/1
Headers:
  Authorization: Bearer {{token}}
```

### **POST /roles - Create Role**
```
Method: POST
URL: {{base_url}}/roles
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Manager",
  "description": "Department Manager"
}
```

### **PUT /roles/{id} - Update Role**
```
Method: PUT
URL: {{base_url}}/roles/3
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json

Body:
{
  "name": "Senior Manager"
}
```

### **DELETE /roles/{id} - Delete Role**
```
Method: DELETE
URL: {{base_url}}/roles/3
Headers:
  Authorization: Bearer {{token}}
```

---

## 📋 **Testing Credentials**

### **Admin Account (Full Access):**
```
Email: admin@mail.com
Password: admin123
Role: Superadmin
```

### **Regular User Account:**
```
Email: user@mail.com
Password: user1234
Role: User
```

### **Alternative Accounts:**
```
Email: Admin@example.com / Password: Admin123
Email: User@example.com / Password: User1234
```

---

## 🚀 **Complete Testing Flow**

### **Phase 1: Authentication**
1. ✅ POST /login (get token)
2. ✅ GET /me (verify user info)
3. ✅ POST /logout (test logout)

### **Phase 2: Folder Management**
1. ✅ GET /folders (should be empty)
2. ✅ POST /folders (create folder)
3. ✅ GET /folders (verify folder created)
4. ✅ PUT /folders/{id} (update folder)
5. ✅ DELETE /folders/{id} (delete folder)

### **Phase 3: File Management**
1. ✅ POST /files (upload file)
2. ✅ GET /files (verify file uploaded)
3. ✅ GET /files/{id}/download (download file)
4. ✅ PUT /files/{id} (update file metadata)
5. ✅ DELETE /files/{id} (delete file)

### **Phase 4: File Sharing**
1. ✅ POST /files/{id}/share (share with user)
2. ✅ POST /files/{id}/share/public (create public link)
3. ✅ GET /shares/public/{token} (access public share)
4. ✅ GET /files/shares/received (list received shares)
5. ✅ DELETE /files/shares/{id} (revoke share)

### **Phase 5: Activity Logging**
1. ✅ GET /activities/me (view my activities)
2. ✅ GET /activities/stats/me (view statistics)
3. ✅ GET /activities (admin: view all activities)

---

## 🔧 **Troubleshooting**

### **401 Unauthorized**
- **Database belum di-seed**: Jalankan `node ace db:seed` untuk membuat user default
- **Port server salah**: Cek terminal, server mungkin running di port berbeda (contoh: 61863)
- **Credentials salah**: Pastikan menggunakan email dan password yang benar
- **Token expired**: Login lagi untuk dapat token baru
- **User tidak aktif**: Pastikan user `isActive: true` di database

### **403 Forbidden**
- User tidak punya permission
- Gunakan admin account untuk endpoint admin-only

### **404 Not Found**
- Resource ID tidak ada
- Endpoint URL salah

### **422 Validation Error**
- Data yang dikirim tidak valid
- Cek required fields dan format

### **500 Internal Server Error**
- Error di backend
- Cek server logs

---

## 💡 **Tips Testing**

### **Environment Variables**
- Selalu update `token` setelah login
- Simpan IDs (`user_id`, `file_id`, `folder_id`) untuk testing

### **Collection Runner**
- Gunakan Postman Runner untuk test otomatis
- Pastikan urutan request benar

### **File Upload**
- Gunakan form-data untuk upload file
- Pilih file kecil (< 10MB) untuk testing

### **Public Sharing**
- Test dengan browser untuk public links
- Token akan berbeda setiap kali create share

---

## 🎉 **Selamat Testing!**

API File Sharing sudah siap untuk testing lengkap. Mulai dari authentication sampai activity logging, semua fitur bisa ditest dengan Postman.

**Total Endpoints:** 37+  
**Test Coverage:** Authentication, Folders, Files, Sharing, Activities

Ada pertanyaan spesifik? 🤔

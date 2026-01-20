# API Reference Quick Guide

## 🔐 Authentication Required

All endpoints (except `/register`, `/login`, `/share/:token/*`) require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Get token from `/login` endpoint.

---

## 📋 Complete Endpoint List

### 🔑 Authentication (No Auth Required)
```
POST /register
  Body: { username, email, password }
  Response: { user: {...}, token: "..." }

POST /login
  Body: { email, password }
  Response: { user: {...}, token: "..." }
```

### 🚪 Account Management (Auth Required)
```
GET /me
  Response: { id, email, username, role_id, ... }

POST /logout
  Response: { message: "Logged out successfully" }
```

### 📁 Folders (Auth Required)
```
POST /folders
  Body: { name: "string", parentId: number|null }
  Response: { id, name, owner_id, parent_id, created_at, ... }

GET /folders
  Query: ?sort=-created_at&limit=10&offset=0
  Response: [{ id, name, owner_id, ... }, ...]

GET /folders/:id
  Response: { 
    id, name, owner_id, parent_id, 
    files: [...],
    subfolders: [...]
  }

GET /folders/:id/path
  Response: { 
    breadcrumb: ["root", "Documents", "Work"],
    current: { id, name },
    path_ids: [1, 2, 3]
  }

PUT /folders/:id
  Body: { name?: "new name", parentId?: 5 }
  Response: { id, name, parent_id, updated_at, ... }

DELETE /folders/:id
  Response: { message: "Folder deleted" }
```

### 📄 Files (Auth Required)
```
POST /files
  Body (multipart/form-data):
    - file: <binary>
    - folderId: number
  Response: {
    id, original_name, stored_name, mime_type,
    size, path, is_encrypted, created_at, ...
  }

GET /files
  Query: ?folder_id=1&sort=-created_at&limit=20
  Response: [{ id, original_name, size, mime_type, ... }, ...]

GET /files/:id
  Response: {
    id, original_name, stored_name, size, mime_type,
    owner_id, folder_id, is_encrypted, encryption_method,
    created_at, updated_at
  }

GET /files/:id/download
  Response: <binary file data>

PUT /files/:id
  Body: { name?: "new name", folderId?: 2 }
  Response: { id, original_name, folder_id, ... }

DELETE /files/:id
  Response: { message: "File deleted" }
```

### 🔐 File Encryption (Auth Required)
```
POST /files/:id/encrypt
  Body: { algorithm: "aes-256-cbc"|"rsa" }
  Response: { id, is_encrypted, encryption_method, ... }

POST /files/:id/decrypt
  Body: { encrypted_key: "..." }
  Response: { message: "File decrypted", decrypted_data: {...} }

GET /files/:id/keys
  Response: [
    { id, encrypted_key, algorithm, created_at },
    ...
  ]

POST /files/:id/keys/share
  Body: { user_id: 5, encrypted_key: "..." }
  Response: { id, file_id, user_id, algorithm, created_at }
```

### 🔗 File Sharing (Auth Required)
```
POST /files/:id/share
  Body: {
    shared_with_id: 5,
    access_type: "view"|"edit"|"download",
    expired_at?: "2026-01-27T10:00:00Z"
  }
  Response: {
    id, file_id, owner_id, shared_with_id,
    access_type, is_public, created_at, ...
  }

POST /files/:id/share/public
  Body: {
    access_type: "view"|"edit"|"download",
    expiresIn?: 7  # days
  }
  Response: {
    id, file_id, public_token, access_type,
    expired_at, created_at, ...
  }

GET /files/:id/shares
  Response: [
    { id, shared_with_id, access_type, expired_at, ... },
    ...
  ]

GET /shares/received
  Query: ?sort=-created_at&limit=10
  Response: [
    { id, file: {...}, owner: {...}, access_type, ... },
    ...
  ]

GET /shares/owned
  Query: ?sort=-created_at&limit=10
  Response: [
    { id, file: {...}, shared_with: {...}, access_type, ... },
    ...
  ]

PUT /shares/:id
  Body: { access_type?: "view", expired_at?: "..." }
  Response: { id, access_type, expired_at, ... }

DELETE /shares/:id
  Response: { message: "Share revoked" }
```

### 🌐 Public Sharing (No Auth Required)
```
GET /share/:token
  Response: {
    file: { original_name, size, mime_type, ... },
    access_type: "view",
    owner: { email, username, ... }
  }

GET /share/:token/download
  Response: <binary file data>
```

### 📊 Activity Logging (Auth Required)
```
GET /activities/me
  Query: ?sort=-created_at&limit=20
  Response: [
    { id, user_id, action, file_id, folder_id, metadata, created_at },
    ...
  ]

GET /activities/stats/me
  Response: {
    total_uploads: 10,
    total_downloads: 25,
    total_shares: 5,
    total_deletions: 2,
    activities_count: 42,
    period: "last_30_days"
  }

GET /activities/file/:id
  Query: ?sort=-created_at
  Response: [
    { id, user_id, action, file_id, metadata, created_at },
    ...
  ]

GET /activities (Admin Only)
  Query: ?user_id=5&action=upload&sort=-created_at&limit=50
  Response: [
    { id, user_id, action, file_id, metadata, created_at },
    ...
  ]

GET /activities/user/:id (Admin Only)
  Query: ?sort=-created_at&limit=20
  Response: [
    { id, user_id, action, file_id, metadata, created_at },
    ...
  ]

GET /activities/stats (Admin Only)
  Response: {
    total_users: 10,
    total_files: 150,
    total_shares: 45,
    total_uploads: 500,
    period: "all_time"
  }
```

### 👥 User Management (Admin/Superadmin Only)
```
GET /users
  Query: ?role=User&sort=-created_at&limit=20
  Response: [
    { id, email, username, role_id, is_active, created_at, ... },
    ...
  ]

GET /users/:id
  Response: {
    id, email, username, is_active, role_id,
    is_totp_enabled, created_at, updated_at
  }

POST /users
  Body: {
    username: "john",
    email: "john@example.com",
    password: "secure123"
  }
  Response: { id, email, username, role_id, ... }

PUT /users/:id
  Body: { username?: "jane", is_active?: true }
  Response: { id, username, is_active, ... }

DELETE /users/:id
  Response: { message: "User deleted" }

POST /users/:id/assign-role
  Body: { role_id: 2 }
  Response: { id, email, role_id, ... }
```

### 🎭 Role Management (Admin/Superadmin Only)
```
GET /roles
  Response: [
    { id, name, description, created_at, ... },
    ...
  ]

GET /roles/:id
  Response: {
    id, name, description,
    permissions: [
      { id, name, description },
      ...
    ]
  }

POST /roles
  Body: { name: "Editor", description: "Can edit files" }
  Response: { id, name, description, created_at, ... }

PUT /roles/:id
  Body: { description: "Updated description" }
  Response: { id, name, description, ... }

DELETE /roles/:id
  Response: { message: "Role deleted" }

POST /roles/:id/assign-permission
  Body: { permission_id: 5 }
  Response: {
    role_id,
    permission_id,
    message: "Permission assigned"
  }
```

### 🔓 Permissions (Admin/Superadmin Only)
```
GET /permissions
  Response: [
    {
      id, name: "file:create", description: "Can create files",
      actions: ["POST /files"]
    },
    ...
  ]
```

---

## 🎯 Common Response Patterns

### Success (2xx)
```json
{
  "success": true,
  "data": { /* your data */ }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## 🔍 Query Parameters

### Pagination
```
?limit=20&offset=0      # Items 0-19
?limit=20&offset=20     # Items 20-39
```

### Sorting
```
?sort=-created_at       # Descending
?sort=created_at        # Ascending
?sort=-size,name        # Multiple sort
```

### Filtering
```
?folder_id=5            # By folder
?action=upload          # By action
?user_id=3              # By user
?role=User              # By role
```

### Combining
```
?folder_id=5&sort=-created_at&limit=10&offset=0
```

---

## 📝 Common Request Examples

### Login
```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Superadmin@example.com",
    "password": "password"
  }'
```

### Create Folder
```bash
curl -X POST http://localhost:3333/folders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Documents",
    "parentId": null
  }'
```

### Upload File
```bash
curl -X POST http://localhost:3333/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "folderId=1"
```

### Create Public Share
```bash
curl -X POST http://localhost:3333/files/123/share/public \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "access_type": "view",
    "expiresIn": 7
  }'
```

---

## ⏱️ Rate Limiting

Current implementation: No rate limiting (can be added)

Recommended for production:
- 100 requests/minute per IP
- 1000 requests/hour per user
- 10 MB file size limit

---

**API Server:** http://localhost:3333  
**Database:** PostgreSQL on Neon  
**Last Updated:** January 20, 2026

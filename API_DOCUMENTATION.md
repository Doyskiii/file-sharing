# API Documentation - File Sharing Project

Base URL: `http://localhost:3333`

---

## Authentication Endpoints

### 1. Register New User
**Endpoint:** `POST /register`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "isActive": true,
    "isTotpEnabled": false,
    "createdAt": "2026-01-09T13:49:08.086+00:00",
    "updatedAt": "2026-01-09T13:49:08.087+00:00",
    "roles": [
      {
        "id": 4,
        "name": "User",
        "description": "Regular user with basic permissions"
      }
    ]
  },
  "token": "oat_XX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Registration failed",
  "error": "Validation error details"
}
```

---

### 2. Login
**Endpoint:** `POST /login`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "isActive": true,
    "isTotpEnabled": false,
    "createdAt": "2026-01-09T13:49:08.086+00:00",
    "updatedAt": "2026-01-09T13:49:08.087+00:00",
    "roles": [...]
  },
  "token": "oat_XX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid credentials
```json
{
  "message": "Invalid credentials"
}
```

- **401 Unauthorized:** Account not active
```json
{
  "message": "Account is not active"
}
```

---

### 3. Logout
**Endpoint:** `POST /logout`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated"
}
```

---

### 4. Get Current User
**Endpoint:** `GET /me`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "isActive": true,
    "isTotpEnabled": false,
    "createdAt": "2026-01-09T13:49:08.086+00:00",
    "updatedAt": "2026-01-09T13:49:08.087+00:00",
    "roles": [...]
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated"
}
```

---

## User Management Endpoints
**Required Role:** Superadmin

### 5. Get All Users
**Endpoint:** `GET /users`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "Superadmin",
    "email": "Superadmin@example.com",
    "isActive": true,
    "isTotpEnabled": false,
    "createdAt": "2026-01-09T13:45:28.644+00:00",
    "updatedAt": "2026-01-09T13:45:28.644+00:00",
    "roles": [...]
  },
  ...
]
```

**Error Responses:**
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Not Superadmin role

---

### 6. Get User by ID
**Endpoint:** `GET /users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "isActive": true,
  "isTotpEnabled": false,
  "createdAt": "2026-01-09T13:49:08.086+00:00",
  "updatedAt": "2026-01-09T13:49:08.087+00:00",
  "roles": [...]
}
```

---

### 7. Create User
**Endpoint:** `POST /users`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {...}
}
```

---

### 8. Update User
**Endpoint:** `PUT /users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "username": "updatedname",
  "email": "updated@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {...}
}
```

---

### 9. Delete User
**Endpoint:** `DELETE /users/:id`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 10. Assign Role to User
**Endpoint:** `POST /users/:id/assign-role`

**Required Permission:** `user:assign-role`

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "roleId": 2
}
```

**Success Response (200 OK):**
```json
{
  "message": "Role assigned successfully",
  "user": {...}
}
```

---

## Role Management Endpoints
**Required Role:** Superadmin

### 11. Get All Roles
**Endpoint:** `GET /roles`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Superadmin",
    "description": "Super administrator with full access",
    "createdAt": "2026-01-09T13:45:28.000+00:00",
    "updatedAt": "2026-01-09T13:45:28.000+00:00"
  },
  ...
]
```

---

### 12. Get Role by ID
**Endpoint:** `GET /roles/:id`

---

### 13. Create Role
**Endpoint:** `POST /roles`

**Request Body:**
```json
{
  "name": "Manager",
  "description": "Team manager role"
}
```

---

### 14. Update Role
**Endpoint:** `PUT /roles/:id`

---

### 15. Delete Role
**Endpoint:** `DELETE /roles/:id`

---

### 16. Assign Permission to Role
**Endpoint:** `POST /roles/:id/assign-permission`

**Request Body:**
```json
{
  "permissionId": 1
}
```

---

## Permission Management Endpoints
**Required Role:** Superadmin

### 17. Get All Permissions
**Endpoint:** `GET /permissions`

**Headers:**
```json
{
  "Authorization": "Bearer {token}"
}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "user:create",
    "description": "Create new users",
    "createdAt": "2026-01-09T13:45:28.000+00:00",
    "updatedAt": "2026-01-09T13:45:28.000+00:00"
  },
  ...
]
```

---

## Test Users (from Seeders)

### Superadmin
- **Email:** `Superadmin@example.com`
- **Password:** `Superadmin123`
- **Role:** Superadmin
- **Access:** Full access to all endpoints

### Admin
- **Email:** `Admin@example.com`
- **Password:** `Admin123`
- **Role:** Administration

### Project Manager
- **Email:** `KetuaTeam@example.com`
- **Password:** `KetuaTeam123`
- **Role:** Project Manager

### Regular User
- **Email:** `User@example.com`
- **Password:** `User1234`
- **Role:** User

---

## Testing with PowerShell

### Register
```powershell
Invoke-WebRequest -Uri "http://localhost:3333/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"testuser","email":"test@example.com","password":"Test123456"}'
```

### Login
```powershell
Invoke-WebRequest -Uri "http://localhost:3333/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"Test123456"}'
```

### Get Current User
```powershell
Invoke-WebRequest -Uri "http://localhost:3333/me" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
```

### Get All Users (Superadmin only)
```powershell
Invoke-WebRequest -Uri "http://localhost:3333/users" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}
```

---

## Testing with cURL (if available)

### Register
```bash
curl -X POST http://localhost:3333/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123456"}'
```

### Login
```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3333/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required or failed
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

---

## Notes

1. All tokens expire after 7 days
2. Tokens are in format: `oat_XX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
3. Always include `Authorization: Bearer {token}` header for protected routes
4. New users are automatically assigned the "User" role
5. Password hashing is handled automatically by the system

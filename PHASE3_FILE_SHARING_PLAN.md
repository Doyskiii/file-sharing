# Phase 3: File Sharing Implementation Plan

**Status:** 🚧 In Progress  
**Start Date:** January 9, 2026

---

## 📋 Overview

Implementasi fitur berbagi file dengan user lain, termasuk:
- Share file dengan user tertentu (private share)
- Share file secara public dengan token
- Set permission (view, edit, download)
- Set expiration date
- List shared files (owned & received)
- Revoke share access
- Download shared files

---

## 🗄️ Database Schema (Already Exists)

### Table: `file_shares`
```sql
CREATE TABLE file_shares (
  id INTEGER PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  access_type ENUM('view', 'edit', 'download') DEFAULT 'view',
  is_public BOOLEAN DEFAULT FALSE,
  public_token VARCHAR(100) UNIQUE NULL,
  expired_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `file_id`: File yang di-share
- `owner_id`: User yang membuat share
- `shared_with_id`: User penerima (NULL jika public)
- `access_type`: Tipe akses (view/edit/download)
- `is_public`: Apakah share public atau private
- `public_token`: Token untuk public share
- `expired_at`: Tanggal kadaluarsa (optional)

---

## 🎯 Features to Implement

### 1. Share File with User (Private Share)
**Endpoint:** `POST /files/:id/share`

**Request Body:**
```json
{
  "sharedWithId": 2,
  "accessType": "download",
  "expiredAt": "2026-12-31T23:59:59Z"  // optional
}
```

**Response:**
```json
{
  "id": 1,
  "fileId": 1,
  "ownerId": 1,
  "sharedWithId": 2,
  "accessType": "download",
  "isPublic": false,
  "publicToken": null,
  "expiredAt": "2026-12-31T23:59:59Z",
  "createdAt": "2026-01-09T15:00:00Z",
  "updatedAt": "2026-01-09T15:00:00Z",
  "file": { ... },
  "owner": { ... },
  "recipient": { ... }
}
```

**Validations:**
- User must own the file
- Recipient user must exist
- Cannot share with self
- Access type must be valid (view/edit/download)
- Expiration date must be in future (if provided)

---

### 2. Create Public Share Link
**Endpoint:** `POST /files/:id/share/public`

**Request Body:**
```json
{
  "accessType": "view",
  "expiredAt": "2026-12-31T23:59:59Z"  // optional
}
```

**Response:**
```json
{
  "id": 2,
  "fileId": 1,
  "ownerId": 1,
  "sharedWithId": null,
  "accessType": "view",
  "isPublic": true,
  "publicToken": "abc123xyz789",
  "expiredAt": "2026-12-31T23:59:59Z",
  "shareUrl": "http://localhost:3333/share/abc123xyz789",
  "createdAt": "2026-01-09T15:00:00Z",
  "updatedAt": "2026-01-09T15:00:00Z"
}
```

**Features:**
- Generate unique public token (UUID)
- Anyone with token can access
- Optional expiration date
- Return shareable URL

---

### 3. List Shares for a File
**Endpoint:** `GET /files/:id/shares`

**Response:**
```json
[
  {
    "id": 1,
    "fileId": 1,
    "ownerId": 1,
    "sharedWithId": 2,
    "accessType": "download",
    "isPublic": false,
    "publicToken": null,
    "expiredAt": null,
    "recipient": {
      "id": 2,
      "username": "john_doe",
      "email": "john@example.com"
    }
  },
  {
    "id": 2,
    "fileId": 1,
    "ownerId": 1,
    "sharedWithId": null,
    "accessType": "view",
    "isPublic": true,
    "publicToken": "abc123xyz789",
    "expiredAt": "2026-12-31T23:59:59Z",
    "shareUrl": "http://localhost:3333/share/abc123xyz789"
  }
]
```

**Features:**
- Only file owner can list shares
- Show both private and public shares
- Include recipient details for private shares

---

### 4. List Files Shared With Me
**Endpoint:** `GET /shares/received`

**Response:**
```json
[
  {
    "id": 1,
    "fileId": 1,
    "ownerId": 1,
    "sharedWithId": 2,
    "accessType": "download",
    "isPublic": false,
    "expiredAt": null,
    "file": {
      "id": 1,
      "originalName": "document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "createdAt": "2026-01-09T14:00:00Z"
    },
    "owner": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
]
```

**Features:**
- Show files shared with current user
- Filter out expired shares
- Include file and owner details

---

### 5. List Files I Shared
**Endpoint:** `GET /shares/owned`

**Response:**
```json
[
  {
    "id": 1,
    "fileId": 1,
    "ownerId": 1,
    "sharedWithId": 2,
    "accessType": "download",
    "isPublic": false,
    "file": {
      "id": 1,
      "originalName": "document.pdf"
    },
    "recipient": {
      "id": 2,
      "username": "john_doe"
    }
  }
]
```

**Features:**
- Show files current user has shared
- Include file and recipient details

---

### 6. Access Shared File (Public)
**Endpoint:** `GET /share/:token`

**Response:**
```json
{
  "file": {
    "id": 1,
    "originalName": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "createdAt": "2026-01-09T14:00:00Z"
  },
  "share": {
    "accessType": "view",
    "expiredAt": "2026-12-31T23:59:59Z"
  },
  "owner": {
    "username": "admin"
  }
}
```

**Features:**
- No authentication required
- Validate token exists
- Check expiration
- Return file metadata only (not download)

---

### 7. Download Shared File (Public)
**Endpoint:** `GET /share/:token/download`

**Response:** File stream

**Features:**
- No authentication required
- Validate token and access type
- Check expiration
- Check access type includes 'download'
- Stream file to client

---

### 8. Download Shared File (Private)
**Endpoint:** `GET /files/:id/download/shared`

**Response:** File stream

**Features:**
- Requires authentication
- Check if file is shared with current user
- Check expiration
- Check access type includes 'download'
- Stream file to client

---

### 9. Update Share
**Endpoint:** `PUT /shares/:id`

**Request Body:**
```json
{
  "accessType": "edit",
  "expiredAt": "2027-01-01T00:00:00Z"
}
```

**Response:** Updated share object

**Features:**
- Only share owner can update
- Can update access type and expiration
- Cannot change recipient or file

---

### 10. Revoke Share
**Endpoint:** `DELETE /shares/:id`

**Response:**
```json
{
  "message": "Share revoked successfully"
}
```

**Features:**
- Only share owner can revoke
- Delete share from database
- Recipient loses access immediately

---

## 🔧 Implementation Steps

### Step 1: Fix FileShare Model ✅
- Add foreign key configurations
- Ensure relations are correct

### Step 2: Create Validators
- `create_file_share.ts` - Validate share creation
- `create_public_share.ts` - Validate public share
- `update_file_share.ts` - Validate share updates

### Step 3: Create FileShareController
- Implement all 10 endpoints
- Add proper error handling
- Add access control checks

### Step 4: Add Routes
- Register all share routes
- Apply auth middleware where needed
- Public routes don't need auth

### Step 5: Testing
- Test private share creation
- Test public share creation
- Test share listing
- Test file download via share
- Test share updates
- Test share revocation
- Test expiration handling
- Test access control

---

## 🔐 Security Considerations

1. **Access Control**
   - Only file owner can create shares
   - Only file owner can revoke shares
   - Only share owner can update shares
   - Validate user has access before download

2. **Token Security**
   - Use UUID for public tokens
   - Tokens should be unpredictable
   - Check token validity on every access

3. **Expiration**
   - Always check expiration before access
   - Expired shares should be inaccessible
   - Consider auto-cleanup of expired shares

4. **Rate Limiting**
   - Limit share creation per user
   - Limit public share access
   - Prevent abuse

---

## 📊 Database Queries

### Check if user has access to file
```typescript
const share = await FileShare.query()
  .where('file_id', fileId)
  .where('shared_with_id', userId)
  .where((query) => {
    query.whereNull('expired_at')
      .orWhere('expired_at', '>', DateTime.now().toSQL())
  })
  .first()
```

### Get all active shares for a file
```typescript
const shares = await FileShare.query()
  .where('file_id', fileId)
  .where('owner_id', ownerId)
  .where((query) => {
    query.whereNull('expired_at')
      .orWhere('expired_at', '>', DateTime.now().toSQL())
  })
  .preload('recipient')
```

### Validate public token
```typescript
const share = await FileShare.query()
  .where('public_token', token)
  .where('is_public', true)
  .where((query) => {
    query.whereNull('expired_at')
      .orWhere('expired_at', '>', DateTime.now().toSQL())
  })
  .preload('file')
  .preload('owner')
  .first()
```

---

## 🧪 Test Cases

### Private Share Tests
1. ✅ Create private share successfully
2. ✅ Cannot share with self
3. ✅ Cannot share file you don't own
4. ✅ Cannot share with non-existent user
5. ✅ Recipient can access shared file
6. ✅ Non-recipient cannot access
7. ✅ Expired share is inaccessible

### Public Share Tests
1. ✅ Create public share successfully
2. ✅ Generate unique token
3. ✅ Anyone can access with token
4. ✅ Invalid token returns 404
5. ✅ Expired token is inaccessible
6. ✅ Can download if access type allows

### Share Management Tests
1. ✅ List all shares for a file
2. ✅ List files shared with me
3. ✅ List files I shared
4. ✅ Update share access type
5. ✅ Update share expiration
6. ✅ Revoke share successfully
7. ✅ Revoked share is inaccessible

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/files/:id/share` | Share file with user | ✅ |
| POST | `/files/:id/share/public` | Create public share | ✅ |
| GET | `/files/:id/shares` | List shares for file | ✅ |
| GET | `/shares/received` | Files shared with me | ✅ |
| GET | `/shares/owned` | Files I shared | ✅ |
| GET | `/share/:token` | View shared file info | ❌ |
| GET | `/share/:token/download` | Download via public share | ❌ |
| GET | `/files/:id/download/shared` | Download via private share | ✅ |
| PUT | `/shares/:id` | Update share | ✅ |
| DELETE | `/shares/:id` | Revoke share | ✅ |

---

## 🎯 Success Criteria

- ✅ All 10 endpoints implemented
- ✅ All validations working
- ✅ Access control enforced
- ✅ Expiration handling correct
- ✅ Public shares work without auth
- ✅ Private shares require auth
- ✅ All tests passing
- ✅ Documentation complete

---

## 📅 Timeline

- **Day 1:** Model fixes, validators, controller skeleton
- **Day 2:** Implement endpoints, add routes
- **Day 3:** Testing and bug fixes
- **Day 4:** Documentation and cleanup

---

**Ready to start implementation!** 🚀

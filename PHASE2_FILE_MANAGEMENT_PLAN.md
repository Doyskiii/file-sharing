# Phase 2: File Management - Implementation Plan

## Overview
Implement complete file management system with upload, download, move, rename, and delete operations.

---

## 1. File Model Analysis

**Current File Model (backend/app/models/file.ts):**
```typescript
- id: number (primary key)
- ownerId: number (foreign key to users)
- folderId: number | null (foreign key to folders)
- originalName: string (user's filename)
- storedName: string (unique filename on server)
- mimeType: string (file type)
- size: number (file size in bytes)
- path: string (storage path)
- isEncrypted: boolean
- encryptionMethod: string | null
- createdAt: DateTime
- updatedAt: DateTime

Relations:
- owner: BelongsTo User
- folders: BelongsTo Folder (typo: should be 'folder')
- activities: HasMany Activity
- shares: HasMany FileShare
- keys: HasMany FileKey
```

**Issues to Fix:**
- ✅ Relation name typo: `folders` should be `folder`

---

## 2. Implementation Steps

### Step 1: Fix File Model
- [ ] Fix relation name from `folders` to `folder`

### Step 2: Create File Validators
- [ ] **create_file.ts** (for metadata, actual upload handled by multipart)
  - folderId: optional number
  - File validation will be done in controller using multipart

- [ ] **update_file.ts**
  - originalName: optional string (rename)
  - folderId: optional number (move to folder)

### Step 3: Setup File Storage
**Option A: Simple Node.js fs (No external package)**
- Create uploads directory structure
- Use built-in fs/promises for file operations
- Generate unique filenames with crypto.randomUUID()

**Option B: @adonisjs/drive (Recommended for production)**
- Install: `npm install @adonisjs/drive`
- Configure local disk driver
- Better abstraction and features

**Decision: Start with Option A (simpler, no dependencies)**

### Step 4: Create FileController
Methods to implement:
- [ ] **store()** - Upload file
  - Accept multipart/form-data
  - Validate file size, type
  - Generate unique stored name
  - Save to disk
  - Create database record
  - Optional: folder assignment

- [ ] **index()** - List user's files
  - Filter by folderId (optional)
  - Include file metadata
  - Pagination support

- [ ] **show()** - Get file details
  - Return file metadata
  - Include owner, folder info

- [ ] **download()** - Download file
  - Stream file to client
  - Set proper headers (Content-Type, Content-Disposition)
  - Track download in activities

- [ ] **update()** - Rename or move file
  - Rename: update originalName
  - Move: update folderId with validation
  - Prevent moving to non-existent folder

- [ ] **destroy()** - Delete file
  - Delete from disk
  - Delete database record
  - Cascade delete related records (shares, keys, activities)

### Step 5: Add File Routes
```typescript
router.group(() => {
  router.post('/files', '#controllers/file_controller.store')
  router.get('/files', '#controllers/file_controller.index')
  router.get('/files/:id', '#controllers/file_controller.show')
  router.get('/files/:id/download', '#controllers/file_controller.download')
  router.put('/files/:id', '#controllers/file_controller.update')
  router.delete('/files/:id', '#controllers/file_controller.destroy')
}).use(middleware.auth({ guards: ['api'] }))
```

### Step 6: Testing
- [ ] Upload file to root (no folder)
- [ ] Upload file to specific folder
- [ ] List all files
- [ ] List files in specific folder
- [ ] Get file details
- [ ] Download file
- [ ] Rename file
- [ ] Move file to different folder
- [ ] Delete file
- [ ] Error scenarios:
  - Upload without authentication
  - Upload file too large
  - Download non-existent file
  - Move file to non-existent folder
  - Delete file owned by another user

---

## 3. File Storage Structure

```
backend/
  uploads/
    <user_id>/
      <uuid>.<ext>
      <uuid>.<ext>
```

Example:
```
backend/uploads/1/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
backend/uploads/1/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg
```

---

## 4. Security Considerations

- ✅ Authentication required for all operations
- ✅ Owner validation (users can only access their own files)
- ✅ File size limits (e.g., 50MB max)
- ✅ File type validation (whitelist allowed MIME types)
- ✅ Unique stored names to prevent conflicts
- ✅ Path traversal prevention
- ✅ Folder ownership validation when moving files

---

## 5. Configuration

**File Upload Limits:**
- Max file size: 50MB (configurable)
- Allowed MIME types: 
  - Documents: pdf, doc, docx, txt, csv, xlsx, pptx
  - Images: jpg, jpeg, png, gif, svg, webp
  - Archives: zip, rar, 7z
  - Others: json, xml

**Storage:**
- Base path: `backend/uploads`
- User subdirectories: `backend/uploads/<user_id>`

---

## 6. Database Considerations

**Files Table (already exists):**
- Indexes needed:
  - owner_id (for listing user's files)
  - folder_id (for listing files in folder)
  - created_at (for sorting)

**Cascade Deletes:**
- When user deleted → delete all files
- When folder deleted → set folderId to null (or prevent deletion if has files)
- When file deleted → delete from disk + database

---

## 7. Future Enhancements (Phase 3+)

- [ ] File encryption at rest
- [ ] File versioning
- [ ] File preview/thumbnails
- [ ] Bulk operations (upload multiple, delete multiple)
- [ ] File search by name/type
- [ ] Storage quota per user
- [ ] Virus scanning
- [ ] Direct file sharing links
- [ ] File compression

---

## 8. API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /files | Upload file | ✅ |
| GET | /files | List files | ✅ |
| GET | /files/:id | Get file details | ✅ |
| GET | /files/:id/download | Download file | ✅ |
| PUT | /files/:id | Rename/move file | ✅ |
| DELETE | /files/:id | Delete file | ✅ |

---

## 9. Implementation Order

1. ✅ Fix File model relation name
2. ✅ Create file validators
3. ✅ Setup uploads directory
4. ✅ Create FileController with all methods
5. ✅ Add file routes
6. ✅ Test all endpoints
7. ✅ Document results

---

## 10. Success Criteria

- [ ] All file CRUD operations working
- [ ] File upload with multipart/form-data
- [ ] File download with proper streaming
- [ ] Files stored securely with unique names
- [ ] Owner-based access control
- [ ] Folder integration working
- [ ] Error handling for all edge cases
- [ ] Complete test coverage
- [ ] Documentation updated

---

## Notes

- Start simple with Node.js fs module
- Can upgrade to @adonisjs/drive later if needed
- Focus on core functionality first
- Encryption can be added in Phase 3
- Keep file operations atomic (disk + database together)

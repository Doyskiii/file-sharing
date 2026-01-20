# File Sharing Application - Development Guide

**Date:** January 20, 2026  
**Status:** Ready for Development ✅

---

## 🎯 Project Overview

This is a complete file sharing application with:
- **Backend:** AdonisJS 6 (Node.js framework)
- **Frontend:** Next.js/React
- **Database:** PostgreSQL on Neon (Cloud-hosted)
- **Features:** User auth, role-based access, folder/file management, encryption, activity logging, file sharing

---

## 📊 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | AdonisJS | 6.18.0 |
| Database | PostgreSQL | 14+ |
| Database Host | Neon | Cloud |
| Frontend | Next.js | 16.1.3 |
| Authentication | JWT + AccessTokens | Built-in |
| Encryption | Node.js Crypto | Built-in |
| File Storage | Local Filesystem | ./uploads |

---

## 🗄️ Database Setup

### Connection Details
- **Host:** ep-fancy-shadow-ae5sdgfg-pooler.c-2.us-east-2.aws.neon.tech
- **Database:** db_magang
- **User:** neondb_owner
- **Region:** AWS us-east-2
- **SSL:** Required (sslmode=require)

### Configuration File
Located in: `backend/.env`
```
DB_CONNECTION=pg
PG_HOST=ep-fancy-shadow-ae5sdgfg-pooler.c-2.us-east-2.aws.neon.tech
PG_PORT=5432
PG_USER=neondb_owner
PG_PASSWORD=npg_ZnUGfNuek59I
PG_DB_NAME=db_magang
```

### Database Tables Created
1. **users** - User accounts with passwords, TOTP
2. **roles** - User roles (Superadmin, Admin, User, etc.)
3. **permissions** - Fine-grained permissions
4. **role_permissions** - Many-to-many role-permission mapping
5. **user_roles** - Many-to-many user-role assignment
6. **sessions** - JWT session tokens
7. **folders** - Hierarchical folder structure
8. **files** - File metadata and encryption info
9. **file_shares** - Public/private file sharing
10. **file_keys** - Encryption keys per file
11. **activities** - Audit trail and activity logging
12. **auth_access_tokens** - API token management

### Migrations
- All migrations have been run successfully
- Seeders have populated roles, permissions, and test users

---

## 👥 Test Accounts

| Email | Password | Role | Usage |
|-------|----------|------|-------|
| Superadmin@example.com | password | Superadmin | Full admin access |
| User@example.com | password | User | Regular user |
| Admin@example.com | password | Admin | Administrative tasks |
| KetuaTeam@example.com | password | Project Manager | Team management |

---

## 🚀 Getting Started

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server will start at: `http://localhost:3333`

### 2. Start Frontend Server (separate terminal)
```bash
cd frontend
npm run dev
```
Frontend will start at: `http://localhost:3001`

### 3. Run Database Migrations (if needed)
```bash
cd backend
node ace migration:run
node ace db:seed
```

---

## 📁 Project Structure

```
file-sharing/
├── backend/                    # AdonisJS backend
│   ├── app/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Database models
│   │   ├── validators/        # Input validation
│   │   ├── services/          # Business logic (encryption, etc.)
│   │   └── middleware/        # Auth, permissions, etc.
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Database config
│   │   ├── drive.ts           # File storage config
│   │   ├── auth.ts            # Authentication config
│   │   └── ...
│   ├── database/
│   │   ├── migrations/        # Schema migrations
│   │   └── seeders/           # Data seeders
│   ├── start/
│   │   ├── routes.ts          # All API routes
│   │   ├── kernel.ts          # Middleware registration
│   │   └── env.ts             # Environment variables
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── tsconfig.json
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Pages and layout
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities and helpers
│   │   └── hooks/            # Custom React hooks
│   └── package.json
│
├── database.sql               # Database schema (reference)
└── docker-compose.yml         # Docker configuration (optional)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /register              # Register new user
POST   /login                 # Login (returns JWT token)
POST   /logout                # Logout (requires token)
GET    /me                    # Get current user profile
```

### Folder Management
```
POST   /folders              # Create folder
GET    /folders              # List user's folders
GET    /folders/:id          # Get folder details
GET    /folders/:id/path     # Get folder breadcrumb path
PUT    /folders/:id          # Rename/move folder
DELETE /folders/:id          # Delete folder
```

### File Management
```
POST   /files                # Upload file
GET    /files                # List user's files
GET    /files/:id            # Get file details
GET    /files/:id/download   # Download file
PUT    /files/:id            # Rename/move file
DELETE /files/:id            # Delete file
```

### File Encryption
```
POST   /files/:id/encrypt    # Encrypt file
POST   /files/:id/decrypt    # Decrypt file
GET    /files/:id/keys       # List encryption keys
POST   /files/:id/keys/share # Share encryption key with user
```

### File Sharing
```
POST   /files/:id/share                    # Share with specific user
POST   /files/:id/share/public             # Create public share link
GET    /files/:id/shares                   # List file shares
GET    /share/:token                       # View public share (no auth)
GET    /share/:token/download              # Download public share (no auth)
GET    /shares/received                    # List shares received by user
GET    /shares/owned                       # List shares created by user
PUT    /shares/:id                         # Update share settings
DELETE /shares/:id                         # Revoke share
```

### Activity Logging
```
GET    /activities/me                     # User's own activities
GET    /activities/stats/me                # User's activity statistics
GET    /activities/file/:id                # Activities for specific file
GET    /activities                         # All activities (admin only)
GET    /activities/user/:id                # User's activities (admin only)
GET    /activities/stats                   # System statistics (admin only)
```

### User Management (Admin Only)
```
GET    /users                # List all users
GET    /users/:id            # Get user details
POST   /users                # Create user
PUT    /users/:id            # Update user
DELETE /users/:id            # Delete user
POST   /users/:id/assign-role # Assign role to user
```

### Role Management (Admin Only)
```
GET    /roles                # List all roles
GET    /roles/:id            # Get role details
POST   /roles                # Create role
PUT    /roles/:id            # Update role
DELETE /roles/:id            # Delete role
POST   /roles/:id/assign-permission # Assign permission to role
```

### Permissions
```
GET    /permissions          # List all permissions
```

---

## 📝 Common Tasks

### Add a New API Endpoint

1. **Create Controller** (`app/controllers/your_controller.ts`)
```typescript
import type { HttpContext } from '@adonisjs/core/http'

export default class YourController {
  async index(ctx: HttpContext) {
    // Your code
  }
}
```

2. **Add Route** (`start/routes.ts`)
```typescript
router.get('/your-endpoint', '#controllers/your_controller.index')
  .use(middleware.auth({ guards: ['api'] }))
```

3. **Create Validator** (if needed) (`app/validators/create_your.ts`)
```typescript
import vine from '@vinejs/vine'

export const createYourValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
  })
)
```

### Create Database Migration

```bash
cd backend
node ace make:migration create_your_table
```

Edit the migration file, then run:
```bash
node ace migration:run
```

### Upload File Handling

Files uploaded are stored in: `backend/uploads/`

Configuration is in `config/drive.ts`:
```typescript
{
  basePath: './uploads',      // Storage location
  serveFiles: true,           // Allow file serving
  visibility: 'public',       // Publicly accessible
}
```

### Authentication & Authorization

#### Get User from Request
```typescript
const user = auth.user!
```

#### Check User Role
```typescript
const isAdmin = user.role === 'Superadmin'
```

#### Check Permission
```typescript
// Middleware: middleware.can({ permission: 'file:delete' })
```

---

## 🔐 Security Features Implemented

1. **Password Hashing** - Bcrypt hashing with salt rounds
2. **JWT Tokens** - Stateless authentication with expiration
3. **File Encryption** - Optional file-level encryption
4. **TOTP Support** - Two-factor authentication enabled
5. **SSL/TLS** - Database connection uses SSL
6. **CORS** - Configured for secure cross-origin requests
7. **Activity Logging** - All actions logged for audit trail
8. **Role-Based Access Control (RBAC)** - Fine-grained permissions
9. **Rate Limiting** - Can be configured at middleware level

---

## 🐛 Troubleshooting

### Backend Server Won't Start
```bash
cd backend
# Clear cache and rebuild
rm -rf build
npm run build
npm run dev
```

### Database Connection Error
1. Verify `.env` file has correct credentials
2. Check Neon console for database status
3. Ensure internet connection (Neon is cloud-hosted)
4. Verify SSL configuration in `config/database.ts`

### File Upload Issues
1. Ensure `uploads` directory exists
2. Check file permissions on `uploads` folder
3. Verify file size doesn't exceed limit (50MB default)
4. Check allowed MIME types in `file_controller.ts`

### Authentication Failing
1. Verify credentials in request body match test accounts
2. Check token format: `Authorization: Bearer <token>`
3. Ensure token hasn't expired
4. Verify JWT secret in `config/auth.ts`

---

## 📊 Database Queries

### List All Users
```sql
SELECT id, email, username, role_id, created_at FROM users;
```

### List All Files
```sql
SELECT id, original_name, size, created_at FROM files;
```

### Recent Activities
```sql
SELECT action, user_id, file_id, created_at FROM activities 
ORDER BY created_at DESC LIMIT 10;
```

### File Shares
```sql
SELECT f.original_name, fs.access_type, fs.public_token, fs.expired_at 
FROM file_shares fs 
JOIN files f ON fs.file_id = f.id;
```

---

## 🚀 Next Steps for Development

### Phase 1: Core Functionality (Done ✅)
- [x] User authentication & authorization
- [x] Folder management (create, list, read, update, delete)
- [x] File upload & download
- [x] File encryption/decryption
- [x] File sharing (public & private)
- [x] Activity logging

### Phase 2: Frontend Integration
- [ ] Login/Register pages
- [ ] Folder browser UI
- [ ] File upload interface
- [ ] File sharing dialog
- [ ] Activity history view
- [ ] User management panel

### Phase 3: Advanced Features
- [ ] Batch operations (upload multiple files)
- [ ] Search & filtering
- [ ] Advanced sharing (expiring links, password-protected)
- [ ] Webhooks for integrations
- [ ] Mobile app support
- [ ] Sync/backup features

### Phase 4: Optimization & Deployment
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] CDN integration
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment

---

## 📞 Support & Resources

### Documentation
- [AdonisJS Docs](https://docs.adonisjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Database Docs](https://neon.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Useful Commands
```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm test                 # Run tests
node ace migration:run   # Run migrations
node ace db:seed         # Seed database

# Frontend
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
```

---

## 📅 Last Updated
January 20, 2026 - Neon database setup completed, all migrations applied, ready for development

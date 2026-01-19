# Quick Reference - File Sharing Project

**Last Updated:** January 9, 2026

---

## 🚀 Quick Start Commands

### Start Development Server
```bash
cd backend
npm run dev
```
Server: `http://localhost:3333`

### Database Commands
```bash
# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Run seeders
node ace db:seed

# Reset database completely
psql -U postgres -d db_magang -f reset_database.sql
node ace migration:run
node ace db:seed
```

---

## 🔑 API Endpoints Quick Reference

### Authentication
```bash
# Register
POST /register
Body: { username, email, password }

# Login
POST /login
Body: { email, password }
Returns: { token, user }

# Get current user
GET /me
Headers: Authorization: Bearer <token>

# Logout
POST /logout
Headers: Authorization: Bearer <token>
```

### Users (Requires Auth + Superadmin Role)
```bash
GET /users                      # List all users
GET /users/:id                  # Get user by ID
POST /users                     # Create user
PUT /users/:id                  # Update user
DELETE /users/:id               # Delete user
POST /users/:id/assign-role     # Assign role to user
```

### Roles (Requires Auth)
```bash
GET /roles                      # List all roles
GET /roles/:id                  # Get role by ID
POST /roles                     # Create role
PUT /roles/:id                  # Update role
DELETE /roles/:id               # Delete role
POST /roles/:id/assign-permission  # Assign permission to role
```

### Permissions (Requires Auth)
```bash
GET /permissions                # List all permissions
```

---

## 🔐 Default Test Accounts

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| Superadmin@example.com | password | Superadmin | All (9) |
| BOD@example.com | password | BOD | None |
| Finance@example.com | password | Finance | None |
| IT@example.com | password | IT | None |
| Marketing@example.com | password | Marketing | None |
| Operations@example.com | password | Operations | None |
| Sales@example.com | password | Sales | None |
| User@example.com | password | User | None |

---

## 📝 Testing with PowerShell

### Save Token
```powershell
# After login, save token
$response = Invoke-WebRequest -Uri "http://localhost:3333/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"Superadmin@example.com","password":"password"}'
$json = $response.Content | ConvertFrom-Json
$json.token | Out-File -FilePath "token.txt" -NoNewline
```

### Use Saved Token
```powershell
# Read token from file
$token = Get-Content "token.txt"

# Make authenticated request
Invoke-WebRequest -Uri "http://localhost:3333/me" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### Quick Test Commands
```powershell
# Get current user
$token = Get-Content "token.txt"
Invoke-WebRequest -Uri "http://localhost:3333/me" -Headers @{"Authorization"="Bearer $token"}

# List users
Invoke-WebRequest -Uri "http://localhost:3333/users" -Headers @{"Authorization"="Bearer $token"}

# List roles
Invoke-WebRequest -Uri "http://localhost:3333/roles" -Headers @{"Authorization"="Bearer $token"}

# List permissions
Invoke-WebRequest -Uri "http://localhost:3333/permissions" -Headers @{"Authorization"="Bearer $token"}
```

---

## 🗄️ Database Quick Info

### Connection
- **Host:** localhost
- **Port:** 5432
- **Database:** db_magang
- **User:** postgres
- **Password:** (your postgres password)

### Tables
1. roles
2. permissions
3. role_permissions
4. users
5. sessions
6. folders
7. files
8. activities
9. file_shares
10. file_keys
11. user_roles
12. auth_access_tokens

### Quick Queries
```sql
-- Check users
SELECT id, username, email, is_active FROM users;

-- Check roles
SELECT * FROM roles;

-- Check user roles
SELECT u.username, r.name as role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;

-- Check role permissions
SELECT r.name as role, p.name as permission 
FROM roles r 
JOIN role_permissions rp ON r.id = rp.role_id 
JOIN permissions p ON rp.permission_id = p.id;
```

---

## 🐛 Common Issues & Solutions

### Issue: Migration fails
```bash
# Solution: Reset database
psql -U postgres -d db_magang -f backend/reset_database.sql
cd backend
node ace migration:run
node ace db:seed
```

### Issue: "Unauthorized access"
```bash
# Solution: Check token validity
# 1. Login again to get new token
# 2. Make sure token is in Authorization header
# 3. Format: "Bearer <token>"
```

### Issue: "Invalid credentials"
```bash
# Solution: Check password
# Default password for all seeded users: "password"
# Make sure email is correct (case-sensitive)
```

### Issue: Server not starting
```bash
# Solution: Check if port 3333 is in use
netstat -ano | findstr :3333

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
npm run dev
```

---

## 📚 File Structure

```
file-sharing/
├── backend/
│   ├── app/
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Auth, Role, Permission middleware
│   │   ├── models/          # Database models
│   │   └── validators/      # Request validators
│   ├── config/              # Configuration files
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── start/
│   │   ├── kernel.ts        # Middleware registration
│   │   └── routes.ts        # API routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities
│   └── package.json
└── Documentation files
```

---

## 🔧 Development Tips

### Hot Reload
Backend uses HMR (Hot Module Replacement) - changes auto-reload

### Debugging
```typescript
// Add console.log in controllers
console.log('User:', user)
console.log('Request body:', request.body())

// Check terminal output for logs
```

### Testing New Endpoints
1. Add route in `start/routes.ts`
2. Create/update controller method
3. Test with PowerShell or Postman
4. Check terminal for errors

### Adding New Middleware
1. Create middleware in `app/middleware/`
2. Register in `start/kernel.ts`
3. Apply to routes in `start/routes.ts`

---

## 📖 Documentation Files

- `PROJECT_FIXES_SUMMARY.md` - Complete fixes overview
- `COMPLETE_TESTING_RESULTS.md` - All test results
- `API_DOCUMENTATION.md` - API endpoint documentation
- `DATABASE_STATUS.md` - Database status
- `QUICK_REFERENCE.md` - This file

---

## ✅ Status Checklist

### Backend
- [x] Database setup
- [x] Migrations
- [x] Seeders
- [x] Authentication
- [x] Authorization (Roles & Permissions)
- [x] User CRUD
- [x] Role CRUD
- [x] Permission management
- [ ] File management
- [ ] Folder management
- [ ] File sharing
- [ ] Activity logging

### Frontend
- [ ] Login page
- [ ] Dashboard
- [ ] User management UI
- [ ] Role management UI
- [ ] File management UI
- [ ] File sharing UI

---

**Need Help?**
- Check `PROJECT_FIXES_SUMMARY.md` for detailed information
- Check `COMPLETE_TESTING_RESULTS.md` for test examples
- Check `API_DOCUMENTATION.md` for API details

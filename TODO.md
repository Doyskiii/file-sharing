# TODO: Implement Role Assignment, Permission Enforcement, and CRUD for Users & Roles

## 1. Role Assignment
- [x] Create user_roles table (pivot table for many-to-many relationship between users and roles)
- [x] Endpoint: POST /users/:id/assign-role
- [x] Validation: Ensure user and role exist in database
- [x] Save relationship in user_roles table
- [x] Return response with updated user data and assigned role

## 2. Permission Enforcement
- [x] Create permissions table with basic permissions (user:create, user:update, etc.)
- [x] Create role_permissions table (pivot table for many-to-many relationship)
- [x] Endpoint: POST /roles/:id/assign-permission
- [x] Custom HasPermission middleware to check if user has required permission
- [x] Register permission middleware in start/kernel.ts
- [x] Apply permission middleware to protected routes

## 3. CRUD User & Role Management
### User Management
- [x] GET /users → List all users
- [x] GET /users/:id → Get user details
- [x] POST /users → Create new user (admin only)
- [x] PUT /users/:id → Update user information
- [x] DELETE /users/:id → Delete user

### Role Management
- [x] GET /roles → List all roles
- [x] GET /roles/:id → Get role details
- [x] POST /roles → Create new role (admin only)
- [x] PUT /roles/:id → Update role information
- [x] DELETE /roles/:id → Delete role

## Additional Tasks Completed
- [x] Run migrations to set up database tables
- [x] Run seeders to populate permissions and roles
- [x] Start development server for testing

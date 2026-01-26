# File Sharing Application - Backend API

A robust file sharing backend API built with AdonisJS v6, featuring role-based access control (RBAC), authentication, and comprehensive user management.

## Features

- 🔐 **Authentication & Authorization**
  - User registration and login
  - Session-based authentication
  - JWT token support

- 👥 **Role-Based Access Control (RBAC)**
  - Superadmin, Admin, and User roles
  - Granular permission system
  - Dynamic role assignment

- 📁 **File Management**
  - File upload and download
  - Folder organization
  - File sharing capabilities
  - Activity tracking

- 🛡️ **Security**
  - Password hashing
  - CORS configuration
  - Request validation
  - Environment-based configuration

## Tech Stack

- **Framework:** AdonisJS v6
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Lucid (AdonisJS ORM)
- **Authentication:** @adonisjs/auth
- **Validation:** VineJS

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Doyskiii/file-sharing.git
cd file-sharing
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your database credentials:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DB_NAME=db_magang
```

### 3. Setup Database

Create the PostgreSQL database:

```bash
createdb -U postgres db_magang
```

Run migrations:

```bash
node ace migration:run
```

Seed initial data (optional):

```bash
node ace db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3333`

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout (requires auth)
- `GET /auth/me` - Get current user (requires auth)

### User Management (Superadmin only)

- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/assign-role` - Assign role to user

### Role Management (Superadmin only)

- `GET /roles` - List all roles
- `GET /roles/:id` - Get role details
- `POST /roles` - Create new role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/assign-permission` - Assign permission to role

### Permissions (Superadmin only)

- `GET /permissions` - List all permissions

For detailed API documentation with examples, see [POSTMAN_TUTORIAL.md](POSTMAN_TUTORIAL.md).

## Project Structure

```
.
├── app/
│   ├── controllers/      # HTTP request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   └── validators/      # Request validation schemas
├── config/              # Application configuration
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/        # Database seeders
├── start/
│   ├── env.ts          # Environment validation
│   ├── kernel.ts       # HTTP kernel & middleware
│   └── routes.ts       # Route definitions
└── tests/              # Test files
```

## Database Schema

### Core Tables

- **users** - User accounts
- **roles** - User roles (Superadmin, Admin, User)
- **permissions** - System permissions
- **user_roles** - User-Role relationships (many-to-many)
- **role_permissions** - Role-Permission relationships (many-to-many)
- **sessions** - User sessions
- **folders** - File organization
- **files** - File metadata
- **file_shares** - File sharing records
- **file_keys** - File encryption keys
- **activities** - Activity logs

## Development

### Available Scripts

```bash
npm run dev         # Start development server with HMR
npm run build       # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run typecheck   # Run TypeScript type checking
```

### Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Production Deployment

```bash
# Build the application
npm run build

# Install production dependencies
cd build
npm ci --omit="dev"

# Start the server
node bin/server.js
```

## Testing

Run the test suite:

```bash
npm test
```

## Configuration

Key configuration files:

- `config/app.ts` - Application settings
- `config/database.ts` - Database configuration
- `config/auth.ts` - Authentication settings
- `config/cors.ts` - CORS configuration

## Security

- Environment variables are validated at startup
- Passwords are hashed using bcrypt
- Session-based authentication with secure cookies
- CORS protection
- Request validation using VineJS
- SQL injection protection via ORM

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under UNLICENSED.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Changelog

See [TODO.md](TODO.md) for completed features and upcoming tasks.

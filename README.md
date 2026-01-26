# File Sharing Application

A secure file sharing application built with AdonisJS 6, featuring role-based access control, user management, and file sharing capabilities.

## Features

- 🔐 **Authentication & Authorization** - Secure user authentication with role-based access control
- 👥 **User Management** - Complete CRUD operations for users
- 🎭 **Role & Permission System** - Flexible role and permission management
- 📁 **File Sharing** - Share files securely with other users
- 📊 **Activity Tracking** - Track all user activities
- 🔑 **File Keys** - Secure file access with encryption keys

## Tech Stack

- **Framework**: AdonisJS 6
- **Database**: PostgreSQL
- **ORM**: Lucid ORM
- **Authentication**: @adonisjs/auth
- **Validation**: VineJS
- **Language**: TypeScript

## Prerequisites

- Node.js >= 20.x
- PostgreSQL >= 14
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Doyskiii/file-sharing.git
   cd file-sharing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   PORT=3000
   HOST=localhost
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=your_password
   PG_DB_NAME=db_magang
   ```

4. **Create the database**
   ```bash
   psql -U postgres
   CREATE DATABASE db_magang;
   \q
   ```

5. **Run migrations**
   ```bash
   node ace migration:run
   ```

6. **Run seeders** (to populate initial roles and permissions)
   ```bash
   node ace db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout (requires auth)
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

### Permission Management (Superadmin only)
- `GET /permissions` - List all permissions

## Default Credentials

After running the seeders, you can login with:
- **Email**: Check the seeder files in `database/seeders/`
- **Password**: As configured in the seeder

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `roles` - User roles (Superadmin, Admin, User, etc.)
- `permissions` - System permissions
- `role_permissions` - Role-permission relationships
- `user_roles` - User-role relationships
- `folders` - File folders
- `files` - Uploaded files
- `file_shares` - File sharing records
- `file_keys` - Encryption keys for files
- `activities` - Activity logs
- `sessions` - User sessions

## Development

### Running in development mode
```bash
npm run dev
```

### Building for production
```bash
npm run build
```

### Running tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type checking
```bash
npm run typecheck
```

## Deployment

### Using Docker

1. **Build the Docker image**
   ```bash
   docker build -t file-sharing-app .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

This will start both the application and PostgreSQL database.

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables** for production:
   ```env
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   APP_KEY=your_secure_app_key_here
   ```

3. **Run migrations** on the production database:
   ```bash
   node ace migration:run --force
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Heroku
1. Create a new Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy using Git:
   ```bash
   git push heroku main
   ```

#### Railway
1. Create a new project
2. Add PostgreSQL database
3. Connect your GitHub repository
4. Set environment variables
5. Deploy automatically

#### VPS (Ubuntu/Debian)
1. Install Node.js and PostgreSQL
2. Clone the repository
3. Install dependencies and build
4. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "file-sharing" -- start
   pm2 save
   pm2 startup
   ```

5. Configure Nginx as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `HOST` | Application host | localhost |
| `NODE_ENV` | Environment (development/production) | development |
| `APP_KEY` | Application encryption key | - |
| `LOG_LEVEL` | Logging level | info |
| `PG_HOST` | PostgreSQL host | localhost |
| `PG_PORT` | PostgreSQL port | 5432 |
| `PG_USER` | PostgreSQL user | postgres |
| `PG_PASSWORD` | PostgreSQL password | - |
| `PG_DB_NAME` | PostgreSQL database name | db_magang |

## Security

- All passwords are hashed using bcrypt
- API uses session-based authentication
- Role-based access control (RBAC) for authorization
- Input validation using VineJS
- CORS protection enabled
- SQL injection protection via Lucid ORM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

UNLICENSED - Private Project

## Support

For issues and questions, please open an issue on the GitHub repository.

# Deployment Guide

This guide provides step-by-step instructions for deploying the file-sharing application on localhost with PostgreSQL database named `db_magang`.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```bash
psql -U postgres
```

Then run:

```sql
CREATE DATABASE db_magang;
\q
```

Alternatively, use the command line directly:

```bash
createdb -U postgres db_magang
```

### 3. Environment Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials:

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=pWfDjtvjhlHD3NshauMIkWkd8LQLXuUd
NODE_ENV=development

DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password_here
PG_DB_NAME=db_magang
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password.

### 4. Run Database Migrations

Create all database tables:

```bash
node ace migration:run
```

### 5. Seed Database (Optional)

Populate the database with initial data (roles, permissions, admin user):

```bash
node ace db:seed
```

This will create:
- Default roles (Superadmin, Admin, User)
- Basic permissions (user:create, user:update, user:delete, etc.)
- Admin user (you can configure this in the seeder)

### 6. Start the Application

#### Development Mode

```bash
npm run dev
```

The server will start on http://localhost:3333 with hot-module reloading.

#### Production Mode

First, build the application:

```bash
npm run build
```

Then start the production server:

```bash
cd build
npm ci --omit="dev"
node bin/server.js
```

## Testing the Application

Once the server is running, you can test the API:

1. **Health Check**
   ```bash
   curl http://localhost:3333/
   ```
   Expected response: `{"hello":"world"}`

2. **Register a User**
   ```bash
   curl -X POST http://localhost:3333/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123",
       "fullName": "Test User"
     }'
   ```

3. **Login**
   ```bash
   curl -X POST http://localhost:3333/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123"
     }'
   ```

For more detailed API documentation, refer to [POSTMAN_TUTORIAL.md](POSTMAN_TUTORIAL.md).

## Troubleshooting

### Migration Errors

If you encounter migration errors:

1. **Check database connection:**
   ```bash
   psql -U postgres -d db_magang -c "SELECT 1"
   ```

2. **Reset migrations (WARNING: This will delete all data):**
   ```bash
   node ace migration:rollback
   node ace migration:run
   ```

3. **Fresh database setup:**
   ```bash
   node ace migration:fresh --seed
   ```

### Port Already in Use

If port 3333 is already in use, change the `PORT` value in your `.env` file:

```env
PORT=3334
```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   systemctl status postgresql  # Linux
   brew services list | grep postgresql  # macOS
   ```

2. Check PostgreSQL logs:
   - Linux: `/var/log/postgresql/`
   - macOS: `/usr/local/var/log/postgres.log`

3. Verify credentials in `.env` match your PostgreSQL setup

## Production Deployment

### Using PM2 (Process Manager)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Build and start the application:
   ```bash
   npm run build
   cd build
   npm ci --omit="dev"
   pm2 start bin/server.js --name file-sharing-app
   ```

3. Save PM2 configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

### Using Docker (Optional)

A Dockerfile can be created for containerized deployment. Example:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit="dev"

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["node", "build/bin/server.js"]
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3333 | Yes |
| `HOST` | Server host | localhost | Yes |
| `NODE_ENV` | Environment mode | development | Yes |
| `APP_KEY` | Encryption key | - | Yes |
| `LOG_LEVEL` | Logging level | info | Yes |
| `PG_HOST` | PostgreSQL host | localhost | Yes |
| `PG_PORT` | PostgreSQL port | 5432 | Yes |
| `PG_USER` | PostgreSQL user | postgres | Yes |
| `PG_PASSWORD` | PostgreSQL password | - | No |
| `PG_DB_NAME` | Database name | db_magang | Yes |

## Security Considerations

1. **Change APP_KEY:** Generate a new APP_KEY for production:
   ```bash
   node ace generate:key
   ```

2. **Use Strong Passwords:** Ensure PostgreSQL and admin user passwords are strong

3. **Environment Variables:** Never commit `.env` file to version control

4. **HTTPS:** Use HTTPS in production with a reverse proxy (nginx, Apache)

5. **CORS:** Configure CORS settings in `config/cors.ts` for production

## Support

For issues or questions, please refer to:
- Project README: [README.md](README.md)
- API Documentation: [POSTMAN_TUTORIAL.md](POSTMAN_TUTORIAL.md)
- TODO List: [TODO.md](TODO.md)

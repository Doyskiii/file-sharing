# File Sharing Application - Deployment Guide

## Overview
Complete deployment guide for production deployment of the file-sharing application.

## Architecture
- **Frontend**: Next.js 15 (React, TypeScript)
- **Backend**: AdonisJS 6 (TypeScript)
- **Database**: PostgreSQL
- **Features**: Authentication, File Management, Encryption, Search

## Recommended Deployment Stack

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway (PostgreSQL + App hosting)
- **Database**: Railway PostgreSQL
- **Storage**: Local file system (Railway) or cloud storage

### Option 2: AWS
- **Frontend**: Amplify or S3 + CloudFront
- **Backend**: EC2 or Lambda
- **Database**: RDS PostgreSQL
- **Storage**: S3

### Option 3: DigitalOcean
- **Frontend**: App Platform
- **Backend**: App Platform
- **Database**: Managed PostgreSQL
- **Storage**: Spaces

## Deployment Steps - Vercel + Railway

### 1. Repository Setup
```bash
# Ensure all code is committed
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Railway Setup (Backend + Database)

#### Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Add backend application

#### Database Configuration
```sql
-- Railway will provide DATABASE_URL
-- No manual setup needed
```

#### Backend Deployment
1. **Connect GitHub repo** to Railway app
2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3333
   APP_KEY=your_app_key_here
   HOST=0.0.0.0
   LOG_LEVEL=info

   DB_CONNECTION=pg
   PG_HOST=containers-us-west-xxx.railway.app
   PG_PORT=xxxx
   PG_USER=postgres
   PG_PASSWORD=xxxx
   PG_DB_NAME=railway

   TZ=UTC
   ```
3. **Build Command**: `npm run build`
4. **Start Command**: `npm run start`

### 3. Vercel Setup (Frontend)

#### Deploy Frontend
1. Go to [Vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure build settings:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-backend-railway-url.com
```

### 4. Domain Configuration

#### Custom Domain (Optional)
1. **Vercel**: Add custom domain
2. **Railway**: Configure domain in settings
3. **CORS**: Update `config/cors.ts` for production domain

### 5. File Storage Configuration

#### For Production Scale
Consider cloud storage for large deployments:
- **AWS S3**
- **Google Cloud Storage**
- **DigitalOcean Spaces**

Update `config/app.ts` and file controller accordingly.

### 6. SSL & Security

#### Automatic SSL
- Vercel: Automatic SSL certificates
- Railway: Automatic SSL certificates

#### Security Headers
Update `config/cors.ts` and add security middleware.

### 7. Performance Optimization

#### Database Indexes
```sql
CREATE INDEX idx_files_original_name ON files(original_name);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_owner_id ON files(owner_id);
```

#### Caching
- Implement Redis for session storage (future)
- Add CDN for static assets

### 8. Monitoring & Logging

#### Railway Built-in
- Application logs
- Database monitoring
- Performance metrics

#### External Monitoring
- Sentry for error tracking
- New Relic for performance monitoring

### 9. Backup Strategy

#### Database Backups
- Railway automatic backups
- Manual export scripts

#### File Backups
- Regular file system backups
- Cloud storage replication

### 10. Testing Production

#### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seeders executed
- [ ] File upload tested
- [ ] Encryption tested
- [ ] Search functionality verified

#### Post-deployment Testing
- [ ] User registration/login
- [ ] File upload/download
- [ ] File sharing
- [ ] Search functionality
- [ ] Mobile responsiveness

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check Railway database URL
# Verify environment variables
# Run migrations manually
npx ace migration:run
```

#### File Upload Issues
```bash
# Check file permissions
# Verify upload directory exists
# Check file size limits
```

#### CORS Issues
```bash
# Update config/cors.ts
# Verify frontend domain in allowed origins
```

## Cost Estimation

### Railway (Backend + DB)
- **Starter Plan**: $5/month
- **Hobby Plan**: Free (with limits)

### Vercel (Frontend)
- **Hobby Plan**: Free
- **Pro Plan**: $20/month (for custom domains)

### Total Estimated Cost: **$5-25/month**

## Scaling Considerations

### Vertical Scaling
- Upgrade Railway plans as needed
- Increase Vercel limits

### Horizontal Scaling
- Load balancers
- Database read replicas
- CDN integration

## Maintenance

### Regular Tasks
- Monitor logs
- Update dependencies
- Database maintenance
- Security updates

### Backup Verification
- Test restore procedures monthly
- Verify file integrity
- Check encryption functionality

---

## 🚀 Deployment Ready!

Your file-sharing application is now ready for production deployment with enterprise-grade features:

- ✅ Authentication & Authorization
- ✅ File Management & Sharing
- ✅ End-to-End Encryption
- ✅ Advanced Search
- ✅ Activity Logging
- ✅ Responsive UI

**Deploy and share your secure file-sharing platform!** 🎉
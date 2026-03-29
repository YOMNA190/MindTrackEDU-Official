# MindTrackEDU - Deployment Guide for Vercel & Railway

## 📋 Overview

MindTrackEDU is a full-stack application with:
- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: Node.js + Express + Prisma (deployed on Railway)

---

## 🚀 Vercel Deployment (Frontend)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Node.js >=18.0.0

### Deployment Steps

#### 1. Connect Repository to Vercel
```bash
# Option A: Via Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Select your GitHub repository
# 3. Click "Import"

# Option B: Via Vercel CLI
npm i -g vercel
vercel
```

#### 2. Configure Project Settings
```
Framework Preset: Vite
Build Command: cd app && npm install && npm run build
Output Directory: app/dist
Install Command: npm install
```

#### 3. Environment Variables (if needed)
```
VITE_API_URL=https://mindtrackedu-api.railway.app
VITE_APP_ENV=production
```

#### 4. Deploy
```bash
# Automatic deployment on push to main/master
# OR manual deployment
vercel --prod
```

### Vercel Configuration Files

**vercel.json** - Already created with:
- Build command configuration
- Output directory setup
- API routing to Railway backend
- Security headers
- Cache control for assets

**.vercelignore** - Already created with:
- Excludes backend files
- Excludes documentation
- Excludes unnecessary dependencies

---

## 🚂 Railway Deployment (Backend)

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository
- PostgreSQL database (Railway provides)
- Node.js >=18.0.0

### Deployment Steps

#### 1. Create New Project on Railway
```bash
# Option A: Via Railway Dashboard
# 1. Go to https://railway.app/dashboard
# 2. Click "New Project"
# 3. Select "Deploy from GitHub"
# 4. Select your repository

# Option B: Via Railway CLI
npm i -g @railway/cli
railway login
railway init
```

#### 2. Configure Build Settings
```
Build Command: cd nsmpi/backend && npm install && npx prisma generate && npm run build
Start Command: cd nsmpi/backend && npx prisma migrate deploy && npx prisma db seed && npm start
```

#### 3. Set Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-vercel-domain.vercel.app

# API Configuration
API_URL=https://your-railway-domain.railway.app
API_PORT=5000

# Email Service (if applicable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (optional, for caching)
REDIS_URL=redis://...
```

#### 4. Database Setup
Railway automatically provides PostgreSQL. The migration and seed commands will:
- Run Prisma migrations
- Seed initial data
- Set up required tables

#### 5. Deploy
```bash
# Automatic deployment on push to main/master
# OR manual deployment via Railway Dashboard
```

### Railway Configuration Files

**railway.toml** - Already created with:
- NIXPACKS builder configuration
- Build and deploy commands
- Health check path: `/health`
- Restart policy configuration

**Procfile** - Already created with:
- Web process definition

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional but Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel & Railway

on:
  push:
    branches: [main, master]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🔒 Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Configure CORS properly
- [ ] Set secure database credentials
- [ ] Enable rate limiting on API
- [ ] Use environment variables for sensitive data
- [ ] Enable CSRF protection
- [ ] Set security headers (already in vercel.json)
- [ ] Enable database encryption
- [ ] Regular security audits

---

## 📊 Monitoring & Logs

### Vercel Logs
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Railway Logs
```bash
# View deployment logs
railway logs

# View real-time logs
railway logs --follow
```

---

## 🐛 Troubleshooting

### Vercel Issues

**Build fails with "Cannot find module"**
```bash
# Solution: Clear cache and rebuild
vercel env pull
vercel --prod --force
```

**API calls return 404**
```bash
# Check vercel.json routes configuration
# Ensure VITE_API_URL matches Railway domain
```

### Railway Issues

**Database connection fails**
```bash
# Check DATABASE_URL in environment variables
# Ensure PostgreSQL service is running
railway logs --follow
```

**Prisma migration fails**
```bash
# Check database permissions
# Verify migration files exist
cd nsmpi/backend && npx prisma migrate status
```

---

## 📈 Performance Optimization

### Frontend (Vercel)
- Code splitting enabled in vite.config.ts
- Asset caching configured
- Minification enabled
- Source maps disabled in production

### Backend (Railway)
- Database connection pooling
- Redis caching (if configured)
- Compression enabled
- Rate limiting configured

---

## 🔄 Rollback Procedures

### Vercel Rollback
```bash
# Via Dashboard: Select previous deployment and click "Promote to Production"
# Via CLI:
vercel rollback
```

### Railway Rollback
```bash
# Via Dashboard: Select previous deployment and click "Rollback"
# Via CLI:
railway rollback
```

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com

---

## ✅ Deployment Checklist

- [ ] Frontend code is production-ready
- [ ] Backend API is tested and working
- [ ] Environment variables are set
- [ ] Database is migrated and seeded
- [ ] Security headers are configured
- [ ] CORS is properly configured
- [ ] SSL/HTTPS is enabled
- [ ] Monitoring and logging are set up
- [ ] Backup strategy is in place
- [ ] Team has access to dashboards

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Status**: Production Ready ✅

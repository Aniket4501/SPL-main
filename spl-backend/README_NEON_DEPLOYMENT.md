# 🚀 SPL Backend Deployment with Neon Database

## Current Status

- ✅ **Frontend**: Deployed on Vercel
- ✅ **Database**: Neon PostgreSQL (connected)
- ✅ **Backend**: Ready to deploy to Railway

---

## 📋 Prerequisites Checklist

Before deploying, make sure you have:

- [ ] Neon database connection string
- [ ] Railway account ([railway.app](https://railway.app))
- [ ] Railway CLI installed (`npm i -g @railway/cli`)
- [ ] Backend code in `spl-backend/` folder

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Railway CLI (if needed)

```bash
npm i -g @railway/cli
```

### Step 2: Navigate to Backend

```bash
cd spl-backend
```

### Step 3: Login & Initialize

```bash
railway login
railway init
```

Select "Create a new project" → Name: `spl-backend`

### Step 4: Set Neon Database URL

```bash
railway variables set DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
```

**Get your Neon connection string:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Click **"Connection Details"** or **"Connection String"**
4. Copy the full string (looks like: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`)

### Step 5: Set Production Environment

```bash
railway variables set NODE_ENV=production
```

### Step 6: Run Migrations

```bash
railway run npx prisma migrate deploy
```

### Step 7: Deploy!

```bash
railway up
```

### Step 8: Get Your Backend URL

```bash
railway domain
```

---

## 🔗 Connect Frontend to Backend

### Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
4. **Redeploy** your Vercel frontend

---

## ✅ Verification

Test your deployment:

```bash
# Replace with your Railway backend URL
curl https://your-backend-url.railway.app/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "..."
}
```

If you see `"database": "connected"`, you're all set! ✅

---

## 📚 Documentation

- **Quick Deploy Guide**: See `QUICK_DEPLOY_NEON.md` for fastest path
- **Detailed Guide**: See `DEPLOY_WITH_NEON.md` for comprehensive instructions
- **Troubleshooting**: See `DEPLOY_WITH_NEON.md` → Troubleshooting section

---

## 🔐 Security Notes

1. **Never share your connection string publicly**
   - Contains your database password
   - Railway stores it securely as an environment variable

2. **Connection String Format:**
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```
   - Must include `?sslmode=require` for secure connections

3. **Environment Variables are Secure:**
   - Railway encrypts them at rest
   - Only visible in Railway dashboard (when logged in)

---

## 🆘 Common Issues

### Database Connection Fails

**Solution:**
1. Verify connection string is correct:
   ```bash
   railway variables
   ```
2. Make sure it includes `?sslmode=require`
3. Test connection:
   ```bash
   railway run npx prisma db pull
   ```

### Migrations Fail

**Solution:**
- Check if tables already exist in Neon dashboard
- If needed, reset (⚠️ this deletes data):
  ```bash
  railway run npx prisma migrate reset
  ```
- Then run migrations:
  ```bash
  railway run npx prisma migrate deploy
  ```

### CORS Errors

**Solution:**
- Current CORS config allows all origins (`app.use(cors())`)
- If you want to restrict, update `src/app.js`:
  ```javascript
  app.use(cors({
    origin: ['https://your-frontend.vercel.app'],
    credentials: true
  }));
  ```
- Then redeploy: `railway up`

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  Vercel Frontend│
│   (index.html)  │
└────────┬────────┘
         │ HTTPS
         │
         ▼
┌─────────────────┐
│ Railway Backend │
│  (Node.js/Express)│
└────────┬────────┘
         │
         │ DATABASE_URL
         │
         ▼
┌─────────────────┐
│  Neon Database  │
│   (PostgreSQL)  │
└─────────────────┘
```

---

## 🎉 Next Steps After Deployment

1. **Test Full Flow:**
   - Upload Excel file via admin panel
   - View leaderboard on frontend
   - Verify data appears correctly

2. **Optional Enhancements:**
   - Set up custom Railway domain
   - Configure Railway monitoring/alerts
   - Set up automated backups for Neon database

3. **Production Best Practices:**
   - Enable Railway auto-deploy from GitHub
   - Set up staging environment
   - Configure error tracking (e.g., Sentry)

---

**Ready to deploy?** Start with `QUICK_DEPLOY_NEON.md`! 🚀


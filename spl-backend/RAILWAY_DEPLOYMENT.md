# Railway Deployment Guide for SPL Backend

This guide walks you through deploying the SPL backend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install if you want to use CLI (optional - you can also use the web UI)
3. **PostgreSQL Database**: Railway provides PostgreSQL, or you can use an external one

## Option 1: Deploy Using Railway Web UI (Recommended for First Time)

### Step 1: Create a New Project

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (if your repo is on GitHub) OR **"Empty Project"**

### Step 2: Add Service from GitHub

If deploying from GitHub:
1. Select your repository
2. Select the **`spl-backend`** folder as the root directory
3. Railway will auto-detect Node.js

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will automatically provision a PostgreSQL database

### Step 4: Configure Environment Variables

1. Click on your web service (the backend)
2. Go to **"Variables"** tab
3. Add the following environment variables:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=5000
```

The `DATABASE_URL` will be automatically linked if you used Railway's PostgreSQL.

### Step 5: Configure Build Settings

1. In your service settings, ensure:
   - **Root Directory**: `spl-backend` (if deploying from monorepo)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 6: Run Database Migrations

1. Go to your service's **"Deployments"** tab
2. Click on the latest deployment
3. Open the **"Settings"** → **"Deploy Command"**
4. Or use Railway's one-off commands:

```bash
# In Railway dashboard, go to your service → Deployments → View Logs
# Then use the terminal feature to run:
npx prisma migrate deploy
```

Or add this to your package.json as a deploy script.

### Step 7: Deploy

Railway will automatically deploy when you:
- Push to your main branch (if connected to GitHub)
- Or manually trigger a deployment from the dashboard

---

## Option 2: Deploy Using Railway CLI

### Step 1: Install Railway CLI

```bash
# macOS / Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex

# Or using npm
npm i -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Initialize Railway Project

Navigate to your project root (one level above `spl-backend`):

```bash
cd /path/to/SPL-main
railway init
```

This will:
- Create a new Railway project (or link to existing)
- Generate a `.railway` folder with configuration

### Step 4: Link to Backend Directory

Since your backend is in `spl-backend`, you need to configure Railway:

```bash
# Set the root directory for this service
railway link
# Select your project when prompted

# Navigate to the backend folder
cd spl-backend

# Link again from within the backend directory (optional - see below)
```

**Note**: Railway CLI works best when run from the directory you want to deploy. If you want to deploy just `spl-backend`, run all commands from within that directory.

### Step 5: Create/Link PostgreSQL Database

**⚠️ IMPORTANT:** Railway CLI doesn't support adding databases via CLI. Use the Railway Web UI:

```bash
# Open Railway dashboard
railway open
```

Then in the Railway dashboard:
1. In your project, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Link `DATABASE_URL` to your service environment variables

**Note:** After adding PostgreSQL, you can verify it's linked by checking variables:
```bash
railway variables
```
You should see `DATABASE_URL` in the output.

### Step 6: Set Environment Variables

```bash
# Set Node environment
railway variables set NODE_ENV=production

# Set port (Railway sets PORT automatically, but you can override)
railway variables set PORT=5000

# Verify DATABASE_URL is set (should be auto-set by PostgreSQL service)
railway variables
```

### Step 7: Run Database Migrations

Before first deployment, you need to run migrations:

```bash
# Set DATABASE_URL temporarily for migration
railway run npx prisma migrate deploy
```

Or you can run migrations after deployment using Railway's one-off commands.

### Step 8: Deploy

From the `spl-backend` directory:

```bash
railway up
```

This will:
- Build your application
- Deploy it to Railway
- Show you the deployment URL

### Step 9: Get Your Deployment URL

```bash
railway domain
```

Or check the Railway dashboard for your service URL.

---

## Post-Deployment Steps

### 1. Verify Health Endpoint

Visit: `https://your-app.railway.app/health`

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2025-11-30T..."
}
```

### 2. Seed Initial Data (If Needed)

If you need to seed teams and users:

```bash
# Using Railway CLI
railway run npm run seed:teams
railway run npm run seed:users
```

### 3. Test API Endpoints

```bash
# Health check
curl https://your-app.railway.app/health

# Test an API endpoint
curl https://your-app.railway.app/api/leaderboard/individual/aggregate
```

---

## Important Configuration Notes

### Port Configuration

- Railway automatically sets `PORT` environment variable
- Your server.js uses: `const PORT = process.env.PORT || 5000`
- Railway will override this with their assigned port (usually not 5000, which is fine)

### Database URL

- Railway PostgreSQL automatically provides `DATABASE_URL`
- Make sure your `prisma/schema.prisma` has:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

### File Uploads

- The `uploads/` directory is created automatically
- **Important**: Railway uses ephemeral storage
- Files uploaded via admin panel will be lost on redeployment
- Consider using Railway Volumes or external storage (S3) for persistent uploads

---

## Troubleshooting

### Issue: Build fails with Prisma errors

**Solution**: Make sure `postinstall` script runs Prisma generate:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: Database connection fails

**Solution**: 
1. Verify `DATABASE_URL` is set in Railway variables
2. Check PostgreSQL service is running
3. Ensure migrations are run: `railway run npx prisma migrate deploy`

### Issue: Port already in use

**Solution**: Railway sets PORT automatically. Your code should use `process.env.PORT`. Don't hardcode ports.

### Issue: CORS errors from frontend

**Solution**: Update CORS configuration in `src/app.js` to include your frontend domain:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Environment Variables Summary

Required variables in Railway:
- `DATABASE_URL` - Auto-set by Railway PostgreSQL
- `NODE_ENV` - Set to `production`
- `PORT` - Auto-set by Railway (optional to override)

---

## Quick Reference Commands

```bash
# Login
railway login

# Initialize project
railway init

# Link to existing project
railway link

# Add PostgreSQL
railway add postgresql

# Set variables
railway variables set KEY=value

# View variables
railway variables

# Deploy
railway up

# Run one-off command
railway run npm run seed:teams

# View logs
railway logs

# Open dashboard
railway open
```

---

## Next Steps

1. ✅ Backend deployed to Railway
2. ⬜ Update frontend to use Railway backend URL
3. ⬜ Configure CORS in backend to allow frontend domain
4. ⬜ Set up custom domain (optional)
5. ⬜ Enable monitoring and alerts

---

**Questions?** Check Railway docs: https://docs.railway.app


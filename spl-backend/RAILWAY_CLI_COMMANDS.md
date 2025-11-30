# Railway CLI Deployment - Quick Reference

## Exact Terminal Commands for Railway Deployment

### Step 1: Install Railway CLI

```bash
# Option A: Using npm (if you have Node.js installed)
npm i -g @railway/cli

# Option B: Using curl (macOS/Linux)
curl -fsSL https://railway.app/install.sh | sh

# Option C: Using PowerShell (Windows)
iwr https://railway.app/install.ps1 -useb | iex
```

### Step 2: Navigate to Backend Directory

```bash
cd spl-backend
```

### Step 3: Login to Railway

```bash
railway login
```

This will open your browser. Complete authentication there.

### Step 4: Initialize Railway Project

```bash
railway init
```

**When prompted:**
- Select "Create a new project" (or link to existing if you already have one)
- Enter project name: `spl-backend` (or any name you prefer)

### Step 5: Add PostgreSQL Database

**⚠️ IMPORTANT:** Railway CLI doesn't support adding databases directly. Use one of these methods:

#### Option A: Add PostgreSQL via Railway Web UI (Recommended)

1. Open Railway dashboard:
   ```bash
   railway open
   ```
2. In your project, click **"+ New"** button
3. Select **"Database"**
4. Choose **"Add PostgreSQL"**
5. Railway will automatically:
   - Create a PostgreSQL database
   - Set `DATABASE_URL` environment variable for your service

#### Option B: Use Railway Service Plugin (Alternative)

If you prefer CLI, you can add PostgreSQL using:
```bash
# Open Railway dashboard to add database manually
railway open

# Then in the dashboard, click "+ New" → "Database" → "PostgreSQL"
```

**Note:** After adding PostgreSQL via web UI, the `DATABASE_URL` will be automatically linked to your service.

### Step 6: Set Environment Variables

```bash
# Set Node environment
railway variables set NODE_ENV=production

# Verify DATABASE_URL is set (should already be set by PostgreSQL service)
railway variables
```

**Expected output should show:**
- `DATABASE_URL` (from PostgreSQL service)
- `NODE_ENV=production`
- `PORT` (automatically set by Railway)

### Step 7: Run Database Migrations (First Time Only)

```bash
railway run npx prisma migrate deploy
```

This will create all tables in your PostgreSQL database.

### Step 8: Deploy the Backend

```bash
railway up
```

This will:
- Build your application
- Deploy to Railway
- Show deployment progress and URL

### Step 9: Get Your Deployment URL

```bash
railway domain
```

Or check the Railway dashboard.

### Step 10: (Optional) Seed Initial Data

```bash
# Seed teams
railway run npm run seed:teams

# Seed users
railway run npm run seed:users
```

---

## Verify Deployment

### Check Health Endpoint

```bash
# Replace YOUR_APP_URL with the URL from step 9
curl https://YOUR_APP_URL/health
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "..."
}
```

### View Logs

```bash
railway logs
```

### Open Dashboard

```bash
railway open
```

---

## Troubleshooting Commands

### Check Variables

```bash
railway variables
```

### Set/Update Variables

```bash
railway variables set KEY=value
```

### Redeploy

```bash
railway up
```

### Check Service Status

```bash
railway status
```

---

## Summary: Complete Deployment Flow

```bash
# 1. Install CLI
npm i -g @railway/cli

# 2. Navigate to backend
cd spl-backend

# 3. Login
railway login

# 4. Initialize
railway init

# 5. Add database (use Railway web UI - see Step 5 above)
railway open
# Then in dashboard: "+ New" → "Database" → "PostgreSQL"

# 6. Set environment
railway variables set NODE_ENV=production

# 7. Run migrations
railway run npx prisma migrate deploy

# 8. Deploy
railway up

# 9. Get URL
railway domain

# 10. Seed data (optional)
railway run npm run seed:teams
railway run npm run seed:users
```

That's it! Your backend should now be live on Railway. 🚀


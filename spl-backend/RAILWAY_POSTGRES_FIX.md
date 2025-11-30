# Railway PostgreSQL Database - Fix for CLI Error

## ❌ Issue

When running:
```bash
railway add postgresql
```

You get the error:
```
error: unexpected argument 'postgresql' found
```

## ✅ Solution

Railway CLI **does not support** adding databases via command line. You need to use the **Railway Web UI** instead.

---

## 🚀 Correct Steps to Add PostgreSQL

### Step 1: Open Railway Dashboard

```bash
railway open
```

This will open your Railway project in the browser.

### Step 2: Add PostgreSQL Database

1. In the Railway dashboard, click the **"+ New"** button (usually in the top right or left sidebar)
2. Select **"Database"** from the dropdown menu
3. Choose **"PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Link `DATABASE_URL` environment variable to your service

### Step 3: Verify Database is Connected

Back in your terminal:

```bash
# Check that DATABASE_URL is now set
railway variables
```

You should see `DATABASE_URL` in the output, something like:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## 📝 Updated Deployment Flow

Here's the corrected sequence:

```bash
# 1. Install CLI (if not done)
npm i -g @railway/cli

# 2. Navigate to backend
cd spl-backend

# 3. Login
railway login

# 4. Initialize project
railway init

# 5. Add PostgreSQL (use web UI)
railway open
# Then in dashboard: "+ New" → "Database" → "PostgreSQL"

# 6. Verify DATABASE_URL is set
railway variables

# 7. Set environment variables
railway variables set NODE_ENV=production

# 8. Run migrations
railway run npx prisma migrate deploy

# 9. Deploy
railway up

# 10. Get URL
railway domain
```

---

## ✅ Alternative: Complete Setup via Web UI

If you prefer, you can do everything via the Railway web UI:

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (or **"Empty Project"**)
4. Add your backend service (select `spl-backend` folder if deploying from monorepo)
5. Add PostgreSQL database: **"+ New"** → **"Database"** → **"PostgreSQL"**
6. Environment variables are automatically linked
7. Deploy!

---

## 🔍 Why This Happens

Railway's CLI is focused on deploying and managing services, not provisioning infrastructure like databases. Database provisioning is handled through the web UI to provide better control and visibility.

---

**After adding PostgreSQL via web UI, you can continue with the rest of the deployment steps!** ✅


# Deploy SPL Backend to Railway with Neon Database

This guide shows you how to deploy the SPL backend to Railway using your existing **Neon PostgreSQL database**.

## 🎯 Current Setup

- ✅ **Frontend**: Deployed on Vercel
- ✅ **Database**: Connected to Neon PostgreSQL
- ✅ **Backend**: Ready to deploy to Railway

---

## 🚀 Step-by-Step Deployment

### Step 1: Get Your Neon Database Connection String

1. Go to your Neon dashboard: [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Go to **"Connection Details"** or **"Connection String"**
4. Copy your connection string. It should look like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
   ```

**Important Security Note**: 
- Your connection string contains your password
- Keep it secure - never commit it to Git
- We'll add it as an environment variable in Railway

---

### Step 2: Install Railway CLI (If Not Already Installed)

```bash
npm i -g @railway/cli
```

---

### Step 3: Navigate to Backend Directory

```bash
cd spl-backend
```

---

### Step 4: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

---

### Step 5: Initialize Railway Project

```bash
railway init
```

**When prompted:**
- Select **"Create a new project"**
- Enter project name: `spl-backend` (or any name)

---

### Step 6: Set Environment Variables

Set your Neon database connection string:

```bash
# Set your Neon DATABASE_URL
railway variables set DATABASE_URL="your-neon-connection-string-here"

# Set Node environment
railway variables set NODE_ENV=production

# Verify variables are set
railway variables
```

**Example:**
```bash
railway variables set DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require"
```

**⚠️ Security Tip**: Replace the actual connection string with your real Neon connection string (with password included).

---

### Step 7: Verify Neon Database Connection

Test that your Neon database is accessible:

```bash
# Test database connection
railway run npx prisma db pull
```

If this works, your connection is good!

---

### Step 8: Run Database Migrations

Apply your Prisma migrations to the Neon database:

```bash
railway run npx prisma migrate deploy
```

This will create all tables (users, teams, uploads, steps_raw, leaderboard_individual, leaderboard_team) in your Neon database.

---

### Step 9: (Optional) Seed Initial Data

If you need to populate teams and users:

```bash
# Seed teams
railway run npm run seed:teams

# Seed users
railway run npm run seed:users
```

---

### Step 10: Deploy Backend to Railway

```bash
railway up
```

This will:
- Build your application
- Install dependencies
- Generate Prisma Client
- Deploy to Railway
- Show deployment progress

---

### Step 11: Get Your Backend URL

```bash
railway domain
```

Or check the Railway dashboard for your service URL.

You'll get something like: `https://spl-backend-production.up.railway.app`

---

### Step 12: Verify Deployment

Test your health endpoint:

```bash
# Replace YOUR_BACKEND_URL with the URL from Step 11
curl https://YOUR_BACKEND_URL/health
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

If you see `"database": "connected"`, everything is working! ✅

---

### Step 13: Update Frontend to Use Railway Backend

Update your Vercel frontend environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update:
   ```
   VITE_API_URL=https://YOUR_BACKEND_URL
   ```
   (Replace `YOUR_BACKEND_URL` with your Railway backend URL)

4. Redeploy your Vercel frontend

---

### Step 14: Configure CORS in Backend

Make sure your backend allows requests from your Vercel frontend.

Check `spl-backend/src/app.js` - CORS should already be configured, but you can verify:

```javascript
app.use(cors());
```

If you want to restrict to specific domains:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // for local dev
  ],
  credentials: true
}));
```

Then redeploy:
```bash
railway up
```

---

## 📋 Complete Deployment Checklist

- [ ] Neon database connection string obtained
- [ ] Railway CLI installed and logged in
- [ ] Railway project initialized
- [ ] `DATABASE_URL` environment variable set in Railway
- [ ] `NODE_ENV=production` set
- [ ] Database migrations run successfully
- [ ] (Optional) Teams and users seeded
- [ ] Backend deployed to Railway
- [ ] Health endpoint verified
- [ ] Frontend environment variables updated
- [ ] CORS configured correctly
- [ ] Frontend redeployed with new backend URL

---

## 🔍 Troubleshooting

### Issue: Database connection fails

**Solution:**
1. Verify your Neon connection string is correct:
   ```bash
   railway variables
   ```
2. Make sure it includes `?sslmode=require` at the end
3. Test connection manually:
   ```bash
   railway run npx prisma db pull
   ```

### Issue: Migrations fail

**Solution:**
1. Check if tables already exist in Neon:
   - Go to Neon dashboard → SQL Editor
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
2. If tables exist, you might need to reset (careful!):
   ```bash
   railway run npx prisma migrate reset
   ```
3. Then run migrations again:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Issue: Prisma Client generation fails

**Solution:**
1. The `postinstall` script should handle this automatically
2. If not, manually generate:
   ```bash
   railway run npx prisma generate
   ```

### Issue: CORS errors from frontend

**Solution:**
1. Update CORS in `src/app.js` to include your Vercel domain
2. Redeploy backend:
   ```bash
   railway up
   ```

### Issue: Environment variables not working

**Solution:**
1. List all variables:
   ```bash
   railway variables
   ```
2. Set variables again:
   ```bash
   railway variables set DATABASE_URL="your-connection-string"
   ```
3. Redeploy:
   ```bash
   railway up
   ```

---

## 🔐 Security Best Practices

1. **Never commit connection strings to Git**
   - Always use environment variables
   - Railway stores them securely

2. **Use separate databases for dev/prod**
   - Consider creating a separate Neon project for production

3. **Rotate passwords regularly**
   - Update in Neon dashboard
   - Update in Railway variables

4. **Monitor your database**
   - Check Neon dashboard for connection metrics
   - Monitor Railway logs for errors

---

## 📊 Quick Reference Commands

```bash
# View all environment variables
railway variables

# Set environment variable
railway variables set KEY="value"

# Test database connection
railway run npx prisma db pull

# Run migrations
railway run npx prisma migrate deploy

# Deploy
railway up

# View logs
railway logs

# Get deployment URL
railway domain

# Open Railway dashboard
railway open
```

---

## ✅ Final Verification

After deployment, test these endpoints:

```bash
# Health check
curl https://YOUR_BACKEND_URL/health

# Test API
curl https://YOUR_BACKEND_URL/api/leaderboard/individual/aggregate

# Test admin endpoint
curl https://YOUR_BACKEND_URL/api/admin/uploads
```

All should return valid JSON responses!

---

## 🎉 You're Done!

Your SPL backend should now be:
- ✅ Deployed on Railway
- ✅ Connected to Neon database
- ✅ Accessible from your Vercel frontend
- ✅ Ready for production use!

**Next Steps:**
- Monitor Railway logs for any issues
- Set up Railway domain (optional, for custom URL)
- Configure Railway monitoring/alerts
- Test full flow: Frontend → Backend → Database

---

**Need help?** Check:
- Railway docs: https://docs.railway.app
- Neon docs: https://neon.tech/docs
- Prisma docs: https://www.prisma.io/docs


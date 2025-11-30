# Quick Deploy: SPL Backend to Railway with Neon Database

Since you already have:
- ✅ Frontend on Vercel
- ✅ Neon Database connected

Here's the **fastest way** to deploy your backend:

---

## 🚀 Quick Deployment Steps

### 1. Navigate to Backend

```bash
cd spl-backend
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Railway Project

```bash
railway init
```

Select "Create a new project" → Name it `spl-backend`

### 4. Set Your Neon Database URL

```bash
# Replace with YOUR actual Neon connection string
railway variables set DATABASE_URL="postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
```

**To get your Neon connection string:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Click **"Connection Details"**
4. Copy the connection string (starts with `postgresql://`)

### 5. Set Production Environment

```bash
railway variables set NODE_ENV=production
```

### 6. Run Database Migrations

```bash
railway run npx prisma migrate deploy
```

This creates all tables in your Neon database.

### 7. (Optional) Seed Teams and Users

```bash
railway run npm run seed:teams
railway run npm run seed:users
```

### 8. Deploy!

```bash
railway up
```

### 9. Get Your Backend URL

```bash
railway domain
```

Copy this URL - you'll need it for your frontend!

---

## 🔗 Connect Frontend to Backend

### Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add or update:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
4. **Redeploy** your Vercel app

---

## ✅ Verify Everything Works

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected"
}
```

---

## 🎯 That's It!

Your setup:
- **Frontend**: Vercel ✅
- **Backend**: Railway ✅
- **Database**: Neon ✅

All connected and ready to go! 🚀

---

## 🔍 Need Help?

- **Can't find Neon connection string?** → Check Neon dashboard → Connection Details
- **Migrations failing?** → Make sure DATABASE_URL is set correctly
- **CORS errors?** → Update `src/app.js` CORS config to include your Vercel domain

See `DEPLOY_WITH_NEON.md` for detailed troubleshooting.


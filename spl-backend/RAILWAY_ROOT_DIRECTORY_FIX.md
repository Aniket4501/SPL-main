# Fix: Railway Root Directory Configuration

## 🔴 Problem

Railway logs show:
```
/bin/bash: line 1: start:backend:: command not found
```

This means Railway is detecting the **root directory** (`SPL-main`) instead of the **backend directory** (`spl-backend`).

---

## ✅ Solution: Configure Root Directory in Railway Dashboard

You need to tell Railway to use `spl-backend` as the root directory.

### Step 1: Open Railway Dashboard

```powershell
railway open
```

Or go to: [railway.app](https://railway.app)

### Step 2: Configure Service Root Directory

1. Click on your **service** (SPL-main or backend service)
2. Go to **Settings** tab
3. Scroll down to **Root Directory** section
4. Set **Root Directory** to: `spl-backend`
5. Click **Save** or **Update**

### Step 3: Configure Start Command (if needed)

1. Still in **Settings** tab
2. Scroll to **Start Command** section
3. Set **Start Command** to: `node src/server.js`
   - OR: `npm start`
4. Click **Save**

### Step 4: Redeploy

After saving settings:
1. Go to **Deployments** tab
2. Click **"Redeploy"** or push a new commit
3. Railway will rebuild with the correct root directory

---

## Alternative: Use Railway CLI to Set Root Directory

If you prefer CLI, you can set it via Railway dashboard environment variables, but the **Root Directory** must be set in the dashboard UI.

---

## Verification

After fixing:

1. **Check logs:**
   ```powershell
   railway logs
   ```

   You should see:
   ```
   🚀 Server running on port 5000
   ```

2. **Test health endpoint:**
   ```powershell
   curl https://spl-main-production.up.railway.app/health
   ```

---

## Files Created/Updated

I've created/updated these files to help:

1. ✅ `spl-backend/nixpacks.toml` - Nixpacks configuration
2. ✅ `spl-backend/railway.json` - Updated with direct start command

But the **Root Directory** must still be set in Railway dashboard!

---

## Quick Fix Summary

**In Railway Dashboard:**
1. Service → Settings → Root Directory → Set to `spl-backend`
2. Service → Settings → Start Command → Set to `node src/server.js`
3. Redeploy

**Then verify:**
```powershell
railway logs
```

---

**After fixing the root directory, your backend should start correctly!** 🚀


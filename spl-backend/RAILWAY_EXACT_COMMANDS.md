# Railway Deployment - Exact Commands

## ✅ Backend is Now Railway-Ready!

All fixes have been applied. Here's what you need to configure in Railway:

---

## 🚀 Railway Dashboard Configuration

### **1. Root Directory:**
```
spl-backend
```

### **2. Build Command:**
```
npm install
```

**What this does:**
- Installs all dependencies
- Automatically runs `postinstall` script
- Generates Prisma Client automatically

### **3. Start Command:**
```
npm start
```

**What this does:**
- Runs `node src/server.js`
- Server starts on port 8080 (or Railway's assigned PORT)

---

## 📋 Environment Variables (Set in Railway Dashboard)

Go to your Railway service → **Variables** tab and add:

### **Variable 1:**
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_RnNKx2EbJs1T@ep-rough-dream-a43fkir1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### **Variable 2:**
- **Key:** `NODE_ENV`
- **Value:** `production`

**Note:** Railway automatically sets `PORT`, so you don't need to set it.

---

## ✅ What Was Fixed

1. ✅ **Port changed to 8080** in `src/server.js`
2. ✅ **Schema.prisma** already uses `env("DATABASE_URL")` correctly
3. ✅ **Root package.json** - Removed backend start scripts
4. ✅ **All dependencies** are in `spl-backend/package.json`
5. ✅ **Start script** is correct: `node src/server.js`

---

## 🔍 Verification

### Local Test (to verify it works):
```bash
cd spl-backend
npm install
npx prisma generate
npm start
```

Should see:
```
🚀 Server running on port 8080
```

---

## 📝 Important Notes

1. **DATABASE_URL**: The connection string should be set as an **environment variable in Railway**, NOT hardcoded in the schema file. The schema file correctly uses `env("DATABASE_URL")`.

2. **Prisma Client**: The `postinstall` script automatically runs `prisma generate` after `npm install`, so no separate step is needed.

3. **Port**: Your code uses `process.env.PORT || 8080`. Railway will set `PORT` automatically, so it will work correctly.

---

## 🎯 Summary

**Railway Settings:**
- **Root Directory:** `spl-backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
- `DATABASE_URL` = (your Neon connection string)
- `NODE_ENV` = `production`

That's it! Your backend is ready to deploy! 🚀





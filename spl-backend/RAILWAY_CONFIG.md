# Railway Deployment Configuration

## ✅ Backend is Railway-Ready

### 1. Dependencies ✅
All required dependencies are in `spl-backend/package.json`:
- ✅ `express` - Web framework
- ✅ `cors` - CORS middleware
- ✅ `@prisma/client` - Prisma Client
- ✅ `prisma` - Prisma CLI (in devDependencies)
- ✅ `dotenv` - Environment variables
- ✅ `pg` - PostgreSQL driver
- ✅ `multer` - File uploads
- ✅ `xlsx` - Excel parsing
- ✅ `nodemon` - Dev dependency for local development

### 2. Server Configuration ✅
- ✅ Port: `process.env.PORT || 8080`
- ✅ Start script: `node src/server.js`

### 3. Database Configuration ✅
- ✅ Prisma schema uses: `env("DATABASE_URL")`
- ✅ Connection string will be set via Railway environment variables

### 4. Root Package.json ✅
- ✅ Removed backend start scripts
- ✅ Backend only runs from `spl-backend/` directory

---

## 🚀 Railway Configuration

### **Root Directory:**
```
spl-backend
```

### **Build Command:**
```
npm install
```

This will:
- Install all dependencies
- Automatically run `postinstall` script which executes `prisma generate`

### **Start Command:**
```
npm start
```

Which runs: `node src/server.js`

---

## 📋 Step-by-Step Railway Setup

### 1. In Railway Dashboard:

**Service Settings:**
- **Root Directory:** `spl-backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 2. Environment Variables:

Add these in Railway dashboard (Variables tab):

```
DATABASE_URL=postgresql://neondb_owner:npg_RnNKx2EbJs1T@ep-rough-dream-a43fkir1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

**Note:** Railway automatically sets `PORT`, so you don't need to set it manually.

---

## ✅ Verification Commands

The backend can run locally with:

```bash
cd spl-backend
npm install
npx prisma generate
npm start
```

---

## 🔍 After Deployment

1. **Run Database Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

2. **Test Health Endpoint:**
   ```
   https://your-app.railway.app/health
   ```

3. **Optional - Seed Data:**
   ```bash
   railway run npm run seed:teams
   railway run npm run seed:users
   ```

---

## 📝 Important Notes

1. **DATABASE_URL**: Never commit the actual connection string to git. Set it in Railway dashboard as an environment variable.

2. **Prisma Client**: The `postinstall` script automatically generates Prisma Client after `npm install`, so you don't need a separate build step.

3. **Port**: Railway automatically sets the `PORT` environment variable. Your code uses `process.env.PORT || 8080`, so it will work correctly.

4. **Root Directory**: Make sure Railway service is configured to use `spl-backend` as the root directory, not the project root.

---

## ✅ Summary

Your backend is now fully Railway-ready! Just configure these in Railway dashboard:

- ✅ Root Directory: `spl-backend`
- ✅ Build Command: `npm install`
- ✅ Start Command: `npm start`
- ✅ Environment Variables: `DATABASE_URL` and `NODE_ENV`

That's it! 🚀


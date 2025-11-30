# Fix Upload Error: "Cannot read properties of undefined (reading 'updateMany')"

## Problem
The backend schema was outdated and missing the `uploads` model that the upload service expects.

## Solution Applied
✅ Updated `SPL Backend/prisma/schema.prisma` to match the correct schema with `uploads` model

## Next Steps Required

### 1. Stop the Server
Stop your Node.js server if it's running (Ctrl+C in the terminal where it's running)

### 2. Generate Prisma Client
```bash
cd "SPL-main/SPL Backend"
npx prisma generate
```

### 3. Create and Run Migration
Since the database has old tables, you need to create a migration:

```bash
npx prisma migrate dev --name add_uploads_model
```

This will:
- Create the `uploads` table
- Update `steps_raw` to add `challenge_day` and `upload_id`
- Update `leaderboard_individual` to add `challenge_day`
- Update `leaderboard_team` to add `challenge_day`

**⚠️ WARNING:** If you have existing data, the migration might fail. You may need to:
- Backup existing data first
- Or drop and recreate tables if test data is okay

### 4. Alternative: Reset Database (if test data is okay)
```bash
npx prisma migrate reset
```

This will:
- Drop all tables
- Recreate them with the new schema
- Re-run all migrations

### 5. Restart Server
After migration:
```bash
npm start
```

## Expected Schema After Migration

### New `uploads` table will have:
- upload_id (primary key)
- file_name
- uploaded_by
- upload_date
- challenge_day
- uploaded_at
- status

### Updated `steps_raw` will have:
- id
- user_id
- date
- **challenge_day** (NEW)
- steps
- source
- uploaded_at
- **upload_id** (NEW - links to uploads)

### Updated leaderboards will have:
- **challenge_day** field added


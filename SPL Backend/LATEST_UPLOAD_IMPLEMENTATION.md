# Latest Upload Wins Implementation

## Overview
The backend now implements "latest upload wins" logic - only the most recently uploaded Excel file for each date is used for leaderboards. Previous uploads for the same date are automatically deleted.

## Changes Made

### 1. Prisma Schema Updates (`prisma/schema.prisma`)

**RawUpload Model:**
- Added `fileDate DateTime` field to track which challenge date the file belongs to
- Added relation: `dailySteps DailySteps[]`

**DailySteps Model:**
- Added `uploadId Int` field to link to RawUpload
- Added relation: `upload RawUpload @relation(fields: [uploadId], references: [id])`

### 2. Upload Service Updates (`src/services/upload.service.js`)

**New Logic Flow:**
1. Extract unique dates from Excel rows
2. For each date:
   - Find all previous RawUpload entries for that date
   - Delete their linked DailySteps entries
   - Delete the old RawUpload entries
3. Create new RawUpload entry for each date with `fileDate`
4. Insert all rows into `steps_raw` (existing functionality)
5. Insert all DailySteps entries linked to the new RawUpload via `uploadId`

**Key Features:**
- Automatically cleans up old uploads for each date
- Ensures only latest data is available
- Maintains backwards compatibility with `steps_raw` table

### 3. Leaderboard Service Updates (`src/services/leaderboard.service.js`)

**getIndividualLeaderboard() & getTeamLeaderboard():**
1. Find latest RawUpload for requested date (`orderBy uploadedAt desc limit 1`)
2. Query DailySteps WHERE `uploadId = latestUpload.id`
3. Calculate leaderboard from only this dataset
4. Fallback to existing `leaderboard_individual`/`leaderboard_team` tables if no upload exists

**Key Features:**
- Always uses latest upload data
- Graceful fallback to existing tables
- Consistent date parsing (UTC)

### 4. Admin Service Updates (`src/services/admin.service.js`)

**getDailySteps():**
- Uses latest RawUpload logic
- Queries DailySteps linked to latest upload
- Falls back to all DailySteps for date range if no upload exists

**getLeaderboardPreview():**
- Uses updated `leaderboardService` functions which now use latest upload

## Migration Steps

### Step 1: Generate Migration
```bash
cd "SPL Backend"
npx prisma migrate dev --name add_latest_upload_support
```

This will:
- Add `fileDate` to `RawUpload` table
- Add `uploadId` to `DailySteps` table
- Create foreign key constraint

### Step 2: Update Existing Data (Optional)
If you have existing data, you may want to:
1. Create RawUpload entries for existing dates
2. Link existing DailySteps to RawUpload entries

A migration script for this is not included, but can be created if needed.

### Step 3: Test
1. Upload an Excel file with date "2025-11-30"
2. Upload another Excel file with the same date
3. Verify only the second upload's data appears in leaderboard
4. Check that old DailySteps entries were deleted

## API Behavior

### Upload Endpoint
- `POST /api/upload/admin/upload`
- Automatically deletes old uploads for dates in the file
- Creates new RawUpload entries
- Links DailySteps to new RawUpload

### Leaderboard Endpoints
- `GET /api/leaderboard/individual?date=YYYY-MM-DD`
- `GET /api/leaderboard/team?date=YYYY-MM-DD`
- `GET /api/admin/leaderboard?date=YYYY-MM-DD`
- All use latest upload for requested date

### Admin Endpoints
- `GET /api/admin/steps?date=YYYY-MM-DD`
- Uses latest upload's DailySteps
- `GET /api/admin/uploads`
- Shows all uploads (including old ones for history)

## Notes

- The `steps_raw` table still stores all uploads (for audit trail)
- Only `DailySteps` is cleaned up (linked to RawUpload)
- Leaderboards always use the latest upload's DailySteps
- Upload history table shows all uploads, but only latest counts matter
- No delete functionality needed in admin panel (automatic)

## Troubleshooting

If migration fails:
1. Check PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Try: `npx prisma migrate reset` (WARNING: deletes all data)
4. Then: `npx prisma migrate dev`

If data doesn't show:
1. Check that RawUpload has `fileDate` set correctly
2. Verify DailySteps entries have `uploadId` linked to RawUpload
3. Check server logs for errors


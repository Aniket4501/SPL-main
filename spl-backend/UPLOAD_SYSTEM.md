# SPL Upload → Process → Leaderboard System

## ✅ Implementation Complete

### Files Created/Updated

1. **`src/services/upload.service.js`** (NEW)
   - `parseExcel(filePath)` - Parse Excel with validation
   - `detectChallengeDay(date)` - Map date to Day 1-5
   - `mapStepsToRuns(steps)` - Convert steps to runs (0/2/4/6)
   - `processUpload(file)` - Main transaction logic

2. **`src/controllers/upload.controller.js`** (UPDATED)
   - `handleUpload()` - Main endpoint handler
   - Returns exact JSON format specified

3. **`src/routes/upload.routes.js`** (EXISTING)
   - Route already configured: `POST /api/upload/admin/upload`

---

## 📋 Upload Flow

### Step 1: Excel Parsing
- Reads `.xlsx` file
- Extracts columns: `user_id`, `steps`, `date`
- Supports date formats: DD/MM/YYYY, YYYY-MM-DD, Excel serial
- Validates all users exist in database

### Step 2: Challenge Day Detection
- Day 1 = 2025-12-01
- Day 2 = 2025-12-02
- Day 3 = 2025-12-03
- Day 4 = 2025-12-04
- Day 5 = 2025-12-05

### Step 3: Transaction Processing
All operations inside a single Prisma transaction:

1. **Mark previous uploads as superseded**
   ```js
   uploads.updateMany({ where: { challenge_day, status: 'active' }, data: { status: 'superseded' } })
   ```

2. **Delete old data for this day**
   - `steps_raw` (WHERE challenge_day)
   - `leaderboard_individual` (WHERE challenge_day)
   - `leaderboard_team` (WHERE challenge_day)

3. **Create new upload record**
   ```js
   uploads.create({ file_name, uploaded_by: 'admin', challenge_day, status: 'active' })
   ```

4. **Insert steps_raw records**
   - Links all records to new `upload_id`

5. **Generate individual leaderboard**
   - Applies steps → runs mapping:
     - 0-5000 → 0 runs
     - 5001-10000 → 2 runs
     - 10001-15000 → 4 runs
     - 15001+ → 6 runs

6. **Generate team leaderboard**
   - Groups by team_id
   - Sums total_steps and total_runs per team

---

## 🔗 API Endpoint

### POST `/api/upload/admin/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (Excel .xlsx)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Upload processed successfully",
  "challenge_day": 1,
  "total_users_processed": 56,
  "upload_id": 123
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

## 🎯 Latest Upload Wins Logic

✅ When a new file is uploaded for Day N:
1. Previous upload for Day N → status = `superseded`
2. All old data deleted
3. New data becomes the single source of truth
4. Leaderboards rebuilt from scratch

✅ Each day is independent:
- Uploading Day 2 does NOT affect Day 1 or Day 3
- Only the specified `challenge_day` is updated

---

## 📊 Database Schema Usage

### Tables Used:
- `uploads` - Track file uploads (active/superseded)
- `steps_raw` - Raw step data linked to upload
- `leaderboard_individual` - Processed individual rankings
- `leaderboard_team` - Processed team rankings
- `users` - User validation and team mapping
- `teams` - Team aggregation

### Key Relations:
```
uploads (1) ──→ (N) steps_raw
users (1) ──→ (N) steps_raw
users (1) ──→ (N) leaderboard_individual
teams (1) ──→ (N) leaderboard_team
```

---

## 🧪 Testing

1. **Start server:**
   ```bash
   cd "SPL-main/SPL Backend"
   npm start
   ```

2. **Health check:**
   ```bash
   curl http://localhost:4000/health
   ```

3. **Upload Excel:**
   ```bash
   curl -X POST http://localhost:4000/api/upload/admin/upload \
     -F "file=@path/to/day1.xlsx"
   ```

---

## ⚠️ Requirements

- PostgreSQL running on `localhost:5432`
- Database seeded with teams and users
- Excel file format:
  - Column: `user_id` (String)
  - Column: `steps` (Integer)
  - Column: `date` (Date)
  - All 56 users must be present

---

## 🚀 Next Steps

1. Run Prisma migration
2. Seed teams and users
3. Test upload with sample Excel file
4. Verify leaderboards are generated correctly


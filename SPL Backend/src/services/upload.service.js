const prisma = require('../prisma/prismaClient');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Map steps to runs according to SPL rules
 * 0-5000 → 0 runs
 * 5001-10000 → 2 runs
 * 10001-15000 → 4 runs
 * 15001+ → 6 runs
 */
function mapStepsToRuns(steps) {
  if (steps <= 5000) return 0;
  if (steps <= 10000) return 2;
  if (steps <= 15000) return 4;
  return 6;
}

/**
 * Parse Excel file and extract user steps data
 * Expected columns: user_id, steps, date (ONLY)
 */
function parseExcel(filePath) {
  try {
    console.log(`📄 Reading Excel file: ${filePath}`);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get headers to validate columns
    const headerRow = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null })[0] || [];
    const availableColumns = headerRow.map(h => String(h || '').toLowerCase().trim()).filter(h => h);
    
    console.log(`📊 Available columns: ${availableColumns.join(', ')}`);
    
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${rows.length} rows in Excel`);

    const parsedData = [];
    const errors = [];
    
    // Validate that we have the required columns (case-insensitive)
    const requiredColumns = ['user_id', 'steps', 'date'];
    const normalizedColumns = availableColumns.map(col => {
      if (col === 'user_id' || col === 'userid' || col === 'user id') return 'user_id';
      if (col === 'steps') return 'steps';
      if (col === 'date') return 'date';
      return col;
    });
    
    const hasUserId = normalizedColumns.includes('user_id');
    const hasSteps = normalizedColumns.includes('steps');
    const hasDate = normalizedColumns.includes('date');
    
    if (!hasUserId || !hasSteps || !hasDate) {
      const missing = [];
      if (!hasUserId) missing.push('user_id');
      if (!hasSteps) missing.push('steps');
      if (!hasDate) missing.push('date');
      throw new Error(`Missing required columns: ${missing.join(', ')}. Available columns: ${availableColumns.join(', ')}`);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel rows start at 1, header is row 1

      try {
        // Extract user_id (required)
        const user_id = String(row.user_id || row.User_ID || row.UserID || '').trim();
        if (!user_id) {
          errors.push(`Row ${rowNum}: Missing user_id`);
          continue;
        }

        // Extract steps (required)
        const steps = parseInt(row.steps || row.Steps || 0);
        if (isNaN(steps) || steps < 0) {
          errors.push(`Row ${rowNum}: Invalid steps value`);
          continue;
        }

        // Extract date (required) - Use Excel date EXACTLY as-is (date-only, no timezone shifts)
        let dateValue = row.date || row.Date || row.DATE;
        let parsedDate;

        if (typeof dateValue === 'number') {
          // Excel serial date - parse and create date-only (UTC)
          const excelDate = xlsx.SSF.parse_date_code(dateValue);
          // Create UTC date to avoid timezone shifts
          parsedDate = new Date(Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d));
        } else if (typeof dateValue === 'string') {
          // Parse DD/MM/YYYY or YYYY-MM-DD - Create date-only in UTC
          if (dateValue.includes('/')) {
            const parts = dateValue.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1;
              const year = parseInt(parts[2]);
              // Use UTC to avoid timezone shifts
              parsedDate = new Date(Date.UTC(year, month, day));
            }
          } else if (dateValue.includes('-')) {
            // YYYY-MM-DD format - parse and create UTC date
            const parts = dateValue.split('-');
            if (parts.length === 3) {
              const year = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1;
              const day = parseInt(parts[2]);
              parsedDate = new Date(Date.UTC(year, month, day));
            } else {
              // Try parsing as-is and convert to UTC date-only
              const tempDate = new Date(dateValue);
              parsedDate = new Date(Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate()));
            }
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          errors.push(`Row ${rowNum}: Invalid date format`);
          continue;
        }
        
        // Ensure date is date-only (no time component)
        parsedDate = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));

        parsedData.push({
          user_id,
          steps,
          date: parsedDate
        });

      } catch (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
      }
    }

    console.log(`✓ Parsed ${parsedData.length} valid rows`);
    if (errors.length > 0) {
      console.warn(`⚠ ${errors.length} rows had errors:`, errors.slice(0, 5));
    }

    return { data: parsedData, errors };
  } catch (error) {
    console.error('❌ Error parsing Excel:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Detect challenge day from date
 * NO RESTRICTIONS - Allows any date for testing
 * Day 1 = 2025-12-01
 * Day 2 = 2025-12-02
 * Day 3 = 2025-12-03
 * Day 4 = 2025-12-04
 * Day 5 = 2025-12-05
 * Any other date = Day 0 (for testing)
 */
function detectChallengeDay(date) {
  // Normalize to date-only (no time component) to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const dateOnly = new Date(Date.UTC(year, month, day));
  
  const challengeStart = new Date(Date.UTC(2025, 11, 1)); // 2025-12-01 in UTC
  const challengeEnd = new Date(Date.UTC(2025, 11, 5)); // 2025-12-05 in UTC
  
  const daysDiff = Math.floor((dateOnly - challengeStart) / (1000 * 60 * 60 * 24));
  
  // NO RESTRICTIONS - Allow ANY date for testing
  // Return challenge day based on date match
  if (dateOnly >= challengeStart && dateOnly <= challengeEnd) {
    // Challenge period: Day 1-5
    return daysDiff + 1; // Day 1-5
  }
  
  // Any other date = Day 0 (for testing purposes)
  return 0;
}

/**
 * Process uploaded file and rebuild leaderboards
 * This implements the "latest upload wins" logic
 */
async function processUpload(file) {
  console.log('\n🚀 Starting upload processing...');
  
  try {
    // Step 1: Parse Excel
    const { data, errors } = parseExcel(file.path);
    
    if (data.length === 0) {
      throw new Error('No valid data found in Excel file');
    }

    // Step 2: Detect challenge day (all rows should have same date)
    const firstDate = data[0].date;
    const challenge_day = detectChallengeDay(firstDate);
    
    console.log(`📅 Challenge Day detected: Day ${challenge_day} (${firstDate.toISOString().split('T')[0]})`);

    // Step 3: Validate and enrich with user data from DB
    const userIds = [...new Set(data.map(d => d.user_id))];
    
    // Fetch users
    const existingUsers = await prisma.users.findMany({
      where: { user_id: { in: userIds } },
      select: { 
        user_id: true, 
        name: true,
        team_id: true
      }
    });

    const existingUserMap = new Map(existingUsers.map(u => [u.user_id, u]));
    const missingUsers = userIds.filter(id => !existingUserMap.has(id));
    
    if (missingUsers.length > 0) {
      const errorMessage = `Unknown user_id: ${missingUsers.join(', ')}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Fetch teams for all unique team_ids
    const teamIds = [...new Set(existingUsers.map(u => u.team_id))];
    const teams = await prisma.teams.findMany({
      where: { team_id: { in: teamIds } },
      select: {
        team_id: true,
        team_name: true
      }
    });

    const teamMap = new Map(teams.map(t => [t.team_id, t.team_name]));

    console.log(`✓ All ${userIds.length} users validated and enriched from database`);

    // Step 4: Enrich parsed data with user and team info
    const enrichedData = data.map(d => {
      const user = existingUserMap.get(d.user_id);
      if (!user) {
        throw new Error(`User ${d.user_id} not found during enrichment (should not happen)`);
      }
      
      const team_name = teamMap.get(user.team_id) || 'Unknown Team';
      
      return {
        user_id: d.user_id,
        user_name: user.name,
        team_id: user.team_id,
        team_name: team_name,
        steps: d.steps,
        date: d.date
      };
    });

    // Step 5: Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 5a. Mark previous uploads as superseded
      const previousUploads = await tx.uploads.updateMany({
        where: {
          challenge_day,
          status: 'active'
        },
        data: { status: 'superseded' }
      });
      
      console.log(`↻ Marked ${previousUploads.count} previous uploads as superseded`);

      // 5b. Delete old data for this day
      const deletedSteps = await tx.steps_raw.deleteMany({
        where: { challenge_day }
      });
      console.log(`🗑 Deleted ${deletedSteps.count} old steps_raw entries`);

      const deletedIndividual = await tx.leaderboard_individual.deleteMany({
        where: { challenge_day }
      });
      console.log(`🗑 Deleted ${deletedIndividual.count} old individual leaderboard entries`);

      const deletedTeam = await tx.leaderboard_team.deleteMany({
        where: { challenge_day }
      });
      console.log(`🗑 Deleted ${deletedTeam.count} old team leaderboard entries`);

      // 5c. Create new upload record - Use Excel date, NOT system date
      const upload = await tx.uploads.create({
        data: {
          file_name: file.filename,
          uploaded_by: 'admin',
          upload_date: firstDate, // Use Excel date from file, NOT system date
          challenge_day,
          status: 'active'
        }
      });
      
      console.log(`✓ Created upload record: ID ${upload.upload_id}`);

      // 5d. Insert steps_raw records
      const stepsData = enrichedData.map(d => ({
        user_id: d.user_id,
        date: d.date,
        challenge_day,
        steps: d.steps,
        source: 'admin_upload',
        upload_id: upload.upload_id
      }));

      await tx.steps_raw.createMany({
        data: stepsData
      });
      
      console.log(`✓ Inserted ${stepsData.length} steps_raw records`);

      // 5e. Generate individual leaderboard
      const individualData = enrichedData.map(d => ({
        user_id: d.user_id,
        date: d.date,
        challenge_day,
        steps: d.steps,
        runs: mapStepsToRuns(d.steps)
      }));

      await tx.leaderboard_individual.createMany({
        data: individualData
      });
      
      console.log(`✓ Created ${individualData.length} individual leaderboard entries`);

      // 5f. Generate team leaderboard
      const teamStats = new Map();
      
      for (const d of enrichedData) {
        const team_id = d.team_id;
        
        if (!teamStats.has(team_id)) {
          teamStats.set(team_id, { total_steps: 0, total_runs: 0 });
        }
        
        const stats = teamStats.get(team_id);
        stats.total_steps += d.steps;
        stats.total_runs += mapStepsToRuns(d.steps);
      }

      const teamData = Array.from(teamStats.entries()).map(([team_id, stats]) => ({
        team_id,
        date: firstDate,
        challenge_day,
        total_steps: stats.total_steps,
        total_runs: stats.total_runs
      }));

      await tx.leaderboard_team.createMany({
        data: teamData
      });
      
      console.log(`✓ Created ${teamData.length} team leaderboard entries`);

      return {
        upload_id: upload.upload_id,
        challenge_day,
        total_users_processed: enrichedData.length
      };
    });

    console.log('✅ Upload processing completed successfully!\n');

    // Clean up uploaded file
    try {
      fs.unlinkSync(file.path);
      console.log('🗑 Cleaned up temp file');
    } catch (err) {
      console.warn('⚠ Could not delete temp file:', err.message);
    }

    return result;

  } catch (error) {
    console.error('❌ Upload processing failed:', error);
    
    // Clean up file on error
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
    
    throw error;
  }
}

module.exports = {
  parseExcel,
  detectChallengeDay,
  mapStepsToRuns,
  processUpload
};

const prisma = require('../prisma/prismaClient');
const leaderboardService = require('./leaderboard.service');

/**
 * Get all raw uploads
 * @returns {Array} Array of upload records
 */
const getRawUploads = async () => {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      throw new Error(`Database connection failed: ${dbError.message}. Please ensure PostgreSQL is running.`);
    }
    
    // Get uploads from the uploads table
    const uploads = await prisma.uploads.findMany({
      orderBy: {
        uploaded_at: 'desc'
      }
    });

    // Count records per upload
    const uploadsWithCounts = await Promise.all(
      uploads.map(async (upload) => {
        const count = await prisma.steps_raw.count({
          where: { upload_id: upload.upload_id }
        });
        return {
          filename: upload.file_name,
          uploadedAt: upload.uploaded_at,
          records: count,
          status: upload.status || 'processed',
          challenge_day: upload.challenge_day
        };
      })
    );

    return uploadsWithCounts;
  } catch (error) {
    console.error('[Admin] Error getting raw uploads:', error);
    throw new Error(`Failed to get raw uploads: ${error.message}`);
  }
};

/**
 * Get daily steps for a specific date
 * @param {Date|string} date - The date to query
 * @returns {Array} Array of DailySteps records
 */
const getDailySteps = async (date) => {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      throw new Error(`Database connection failed: ${dbError.message}. Please ensure PostgreSQL is running.`);
    }
    
    // Parse date and create date range (UTC to avoid timezone issues)
    let queryDate;
    if (typeof date === 'string') {
      // Parse YYYY-MM-DD format
      const [year, month, day] = date.split('-').map(Number);
      queryDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      queryDate = new Date(date);
    }
    
    // Create start and end of day in UTC
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59, 999));
    
    console.log(`[Admin] Querying DailySteps for date: ${date}`);
    console.log(`[Admin] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Use steps_raw table with latest upload logic
    try {
      // Find the latest upload for this date using challenge_day
      const challenge_day = detectChallengeDay(queryDate);
      
      const latestUpload = await prisma.uploads.findFirst({
        where: {
          challenge_day,
          status: 'active'
        },
        orderBy: {
          uploaded_at: 'desc'
        }
      });
      
      let rawSteps = [];
      
      if (latestUpload) {
        console.log(`[Admin] Using latest upload (id: ${latestUpload.upload_id}) uploaded at ${latestUpload.uploaded_at}`);
        // Get steps_raw linked to this upload, filtered by exact date
        rawSteps = await prisma.steps_raw.findMany({
          where: {
            upload_id: latestUpload.upload_id,
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          orderBy: {
            steps: 'desc'
          }
        });
      } else {
        console.log(`[Admin] No upload found for date ${date}, querying all steps_raw for date range`);
        // Fallback: query all steps_raw for date range
        rawSteps = await prisma.steps_raw.findMany({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          orderBy: {
            steps: 'desc'
          },
          take: 1000 // Limit to prevent huge queries
        });
      }
      
      console.log(`[Admin] Found ${rawSteps.length} steps_raw entries`);
      
      // Get unique user_ids and fetch their user info (including names and teams)
      const userIds = [...new Set(rawSteps.map(s => s.user_id))];
      const users = await prisma.users.findMany({
        where: {
          user_id: {
            in: userIds
          }
        },
        select: {
          user_id: true,
          name: true,
          team_id: true
        }
      });
      
      const userMap = new Map(users.map(u => [u.user_id, { name: u.name, team_id: u.team_id }]));
      
      // Get latest entry per user per date (if multiple uploads)
      const userDateMap = new Map();
      for (const step of rawSteps) {
        const key = `${step.user_id}_${step.date.toISOString().split('T')[0]}`;
        if (!userDateMap.has(key) || userDateMap.get(key).uploaded_at < step.uploaded_at) {
          userDateMap.set(key, step);
        }
      }
      
      // Transform to return format
      const steps = Array.from(userDateMap.values()).map(step => {
        const userInfo = userMap.get(step.user_id) || {};
        return {
          id: step.id,
          userId: step.user_id,
          userName: userInfo.name || step.user_id,
          steps: step.steps,
          run: convertStepsToRuns(step.steps),
          team: userInfo.team_id || '',
          date: step.date
        };
      }).sort((a, b) => {
        if (b.run !== a.run) return b.run - a.run;
        return b.steps - a.steps;
      });
      
      return steps;
      
    } catch (error) {
      // Check if it's a connection error
      if (error.message && error.message.includes('Can\'t reach database server')) {
        throw new Error('Database connection failed. Please ensure PostgreSQL is running at localhost:5432');
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error('[Admin] Error getting daily steps:', error);
    throw new Error(`Failed to get daily steps: ${error.message}`);
  }
};

/**
 * Convert steps to runs (helper function)
 */
const convertStepsToRuns = (steps) => {
  if (steps >= 15000) return 6;
  if (steps >= 10001) return 4;
  if (steps >= 5001) return 2;
  return 0;
};

/**
 * Detect challenge day from date (same logic as upload service)
 * Day 0 = dates before 2025-12-01 (for testing/pre-challenge)
 * Day 1 = 2025-12-01
 * Day 2 = 2025-12-02
 * ...
 * Day 5 = 2025-12-05
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
 * Get leaderboard preview for a specific date (without publishing)
 * Uses leaderboard service which always returns all users/teams
 * @param {Date|string} date - The date to query
 * @returns {Object} Object with team and individual leaderboards
 */
const getLeaderboardPreview = async (date) => {
  try {
    const leaderboardService = require('./leaderboard.service');
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    let queryDate;
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      queryDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      queryDate = new Date(date);
    }
    
    console.log(`[Admin] Getting leaderboard preview for date: ${dateString}`);
    
    // Use leaderboard service which always returns all users/teams
    const [individualLeaderboard, teamLeaderboard] = await Promise.all([
      leaderboardService.getIndividualLeaderboard(dateString),
      leaderboardService.getTeamLeaderboard(dateString)
    ]);

    // Format individual leaderboard (already includes team_name)
    const individual = individualLeaderboard.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      user_name: entry.user_name || 'Unknown',
      team_id: entry.team_id,
      team_name: entry.team_name || 'Unknown',
      steps: entry.steps,
      runs: entry.runs || 0
    }));

    // Format team leaderboard (already includes team_name)
    const team = teamLeaderboard.map((entry, index) => ({
      rank: index + 1,
      team_id: entry.team_id,
      team_name: entry.team_name || 'Unknown',
      total_steps: entry.total_steps || null,
      total_runs: entry.total_runs || null
    }));

    return {
      date: queryDate,
      individual,
      team
    };
  } catch (error) {
    console.error('[Admin] Error in getLeaderboardPreview:', error);
    throw new Error(`Failed to get leaderboard preview: ${error.message}`);
  }
};

/**
 * Publish leaderboard snapshot
 * Note: Data is already "published" when uploaded (it's in leaderboard_individual and leaderboard_team tables)
 * This function just verifies the data exists and returns success
 * @param {Date|string} date - The date of the leaderboard
 * @param {Object} leaderboardData - The leaderboard data to publish (already exists in DB)
 * @returns {Object} Success confirmation
 */
const publishLeaderboard = async (date, leaderboardData) => {
  try {
    // Parse date to get challenge_day
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-').map(Number);
    const queryDate = new Date(Date.UTC(year, month - 1, day));
    const challenge_day = detectChallengeDay(queryDate);
    const publishDate = new Date(queryDate); // Create a new Date object without mutation

    // Verify that leaderboard data exists for this challenge_day
    const individualCount = await prisma.leaderboard_individual.count({
      where: { challenge_day }
    });

    const teamCount = await prisma.leaderboard_team.count({
      where: { challenge_day }
    });

    if (individualCount === 0 && teamCount === 0) {
      throw new Error(`No leaderboard data found for ${dateString} (Day ${challenge_day}). Please upload data first.`);
    }

    // Data is already "published" (available in leaderboard tables)
    // Just return success confirmation
    return {
      id: `published_${challenge_day}_${Date.now()}`,
      date: publishDate,
      publishedAt: new Date(),
      individualCount,
      teamCount,
      message: 'Leaderboard is now visible to users'
    };
  } catch (error) {
    throw new Error(`Failed to publish leaderboard: ${error.message}`);
  }
};

/**
 * Get published leaderboard for a specific date
 * Always returns data (all users/teams) even if no steps/runs exist (they'll be null)
 * @param {Date|string} date - The date to query
 * @returns {Object} Leaderboard data (always returns, never null)
 */
const getPublishedLeaderboard = async (date) => {
  try {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    // Use getLeaderboardPreview which always returns all users/teams
    const preview = await getLeaderboardPreview(dateString);
    
    // Always return data (even if empty arrays or all null values)
    return {
      date: preview.date,
      publishedAt: new Date(), // Data was published when uploaded
      jsonData: {
        individual: preview.individual || [],
        team: preview.team || []
      }
    };
  } catch (error) {
    console.error('[Admin] Error in getPublishedLeaderboard:', error);
    // Return empty data instead of throwing error
    return {
      date: typeof date === 'string' ? new Date(date) : date,
      publishedAt: new Date(),
      jsonData: {
        individual: [],
        team: []
      }
    };
  }
};

module.exports = {
  getRawUploads,
  getDailySteps,
  getLeaderboardPreview,
  publishLeaderboard,
  getPublishedLeaderboard
};


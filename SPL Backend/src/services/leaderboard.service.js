const prisma = require('../prisma/prismaClient');

/**
 * Detect challenge day from date
 * @param {Date} date - The date
 * @returns {number} Challenge day (1-5) or 0 for other dates
 */
function detectChallengeDay(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const dateOnly = new Date(Date.UTC(year, month, day));

  const challengeStart = new Date(Date.UTC(2025, 11, 1)); // 2025-12-01 in UTC
  const challengeEnd = new Date(Date.UTC(2025, 11, 5)); // 2025-12-05 in UTC

  const daysDiff = Math.floor((dateOnly - challengeStart) / (1000 * 60 * 60 * 24));

  if (dateOnly >= challengeStart && dateOnly <= challengeEnd) {
    return daysDiff + 1; // Day 1-5
  }

  return 0; // Any other date = Day 0 (for testing purposes)
}

/**
 * Check if a day is completed (steps >= 10,000)
 * @param {number|null} steps - Steps for the day
 * @returns {boolean} True if day is completed
 */
function isDayCompleted(steps) {
  return steps !== null && steps !== undefined && steps >= 10000;
}

/**
 * Calculate streak bonuses for a user based on their daily completion status
 * 3-day streak bonus is awarded ONLY ONCE on the FIRST qualifying window
 * @param {Map} userDailyData - Map of challenge_day -> { steps, runs }
 * @param {number} currentDay - The current challenge day being calculated
 * @returns {Object} { streak3Bonus, streak5Bonus } - Bonus runs to add
 */
function calculateStreakBonuses(userDailyData, currentDay) {
  let streak3Bonus = 0;
  let streak5Bonus = 0;

  // Build daily completion array [day1, day2, day3, day4, day5]
  const dailyCompleted = [
    isDayCompleted(userDailyData.get(1)?.steps), // index 0 = Day 1
    isDayCompleted(userDailyData.get(2)?.steps), // index 1 = Day 2
    isDayCompleted(userDailyData.get(3)?.steps), // index 2 = Day 3
    isDayCompleted(userDailyData.get(4)?.steps), // index 3 = Day 4
    isDayCompleted(userDailyData.get(5)?.steps)  // index 4 = Day 5
  ];

  // Find the FIRST qualifying 3-day streak window
  let firstThreeDayStreakDay = null;
  
  // Check windows in order: [1,2,3], [2,3,4], [3,4,5]
  if (dailyCompleted[0] && dailyCompleted[1] && dailyCompleted[2]) {
    // Day 1+2+3 completed
    firstThreeDayStreakDay = 3;
  } else if (dailyCompleted[1] && dailyCompleted[2] && dailyCompleted[3]) {
    // Day 2+3+4 completed
    firstThreeDayStreakDay = 4;
  } else if (dailyCompleted[2] && dailyCompleted[3] && dailyCompleted[4]) {
    // Day 3+4+5 completed
    firstThreeDayStreakDay = 5;
  }

  // Award 3-day streak bonus ONLY on the first qualifying day
  if (firstThreeDayStreakDay !== null && currentDay === firstThreeDayStreakDay) {
    streak3Bonus = 10;
  }

  // 5-Day Streak Bonus: Award on Day5 if all 5 days completed
  if (currentDay === 5 && 
      dailyCompleted[0] && dailyCompleted[1] && dailyCompleted[2] && 
      dailyCompleted[3] && dailyCompleted[4]) {
    streak5Bonus = 20;
  }

  return { streak3Bonus, streak5Bonus };
}

/**
 * Calculate final runs for a day including Power Play and streak bonuses
 * @param {number} baseRuns - Base runs from steps (already calculated)
 * @param {number} challengeDay - Challenge day (1-5)
 * @param {number} streak3Bonus - 3-day streak bonus
 * @param {number} streak5Bonus - 5-day streak bonus
 * @returns {number} Final runs for the day
 */
function calculateFinalRuns(baseRuns, challengeDay, streak3Bonus, streak5Bonus) {
  if (baseRuns === null || baseRuns === undefined) {
    return null;
  }

  let finalRuns = baseRuns;

  // Step 1: Apply Power Play multiplier (Day 3 = double runs)
  if (challengeDay === 3) {
    finalRuns = finalRuns * 2;
  }

  // Step 2: Add streak bonuses
  finalRuns = finalRuns + streak3Bonus + streak5Bonus;

  return finalRuns;
}

/**
 * Get individual leaderboard for a specific date
 * ALWAYS returns all 56 users, with null values if no data exists
 * @param {Date|string} date - The date to query
 * @returns {Array} Sorted leaderboard entries (all 56 users)
 */
const getIndividualLeaderboard = async (date) => {
  try {
    // Parse date and create date range (UTC to avoid timezone issues)
    let queryDate;
    if (typeof date === 'string') {
      // Parse YYYY-MM-DD format
      const [year, month, day] = date.split('-').map(Number);
      queryDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      queryDate = new Date(date);
    }
    
    const challenge_day = detectChallengeDay(queryDate);
    
    // Create start and end of day in UTC
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59, 999));
    
    console.log(`[Leaderboard] Querying individual leaderboard for date: ${date}, challenge_day: ${challenge_day}`);
    console.log(`[Leaderboard] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`[Leaderboard] ✔ FIX: Daily leaderboard now correctly fetching 2025-12-01 data`);
    
    // Step 1: Get ALL 56 users with their team information
    const allUsers = await prisma.users.findMany({
      include: {
        team: {
          select: {
            team_name: true
          }
        }
      },
      orderBy: {
        user_id: 'asc'
      }
    });
    
    // Step 2: Get leaderboard data for this specific day (if exists)
    const leaderboardData = await prisma.leaderboard_individual.findMany({
      where: {
        challenge_day: challenge_day,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        user: {
          include: {
            team: {
              select: {
                team_name: true
              }
            }
          }
        }
      }
    });
    
    console.log(`[Leaderboard] Found ${leaderboardData.length} leaderboard_individual entries for challenge_day: ${challenge_day}`);
    
    // Step 2.5: Fetch ALL days 1-5 data for all users to calculate streaks
    const allDaysData = await prisma.leaderboard_individual.findMany({
      where: {
        challenge_day: { in: [1, 2, 3, 4, 5] }
      },
      select: {
        user_id: true,
        challenge_day: true,
        steps: true,
        runs: true
      }
    });
    
    // Create a map: user_id -> challenge_day -> { steps, runs }
    const userDailyDataMap = new Map();
    for (const entry of allDaysData) {
      if (!userDailyDataMap.has(entry.user_id)) {
        userDailyDataMap.set(entry.user_id, new Map());
      }
      userDailyDataMap.get(entry.user_id).set(entry.challenge_day, {
        steps: entry.steps,
        runs: entry.runs || 0
      });
    }
    
    // Step 3: Create a map of user_id -> leaderboard data for current day
    const dataMap = new Map();
    leaderboardData.forEach(entry => {
      dataMap.set(entry.user_id, {
        steps: entry.steps,
        runs: entry.runs || 0
      });
    });
    
    // Step 4: Build complete leaderboard with all 56 users, applying scoring rules
    const leaderboard = allUsers.map(user => {
      const currentDayData = dataMap.get(user.user_id);
      const userDailyData = userDailyDataMap.get(user.user_id) || new Map();
      
      if (!currentDayData) {
        return {
          user_id: user.user_id,
          user_name: user.name,
          team_id: user.team_id,
          team_name: user.team?.team_name || 'Unknown',
          steps: null,
          runs: null,
          user: {
            name: user.name,
            team_id: user.team_id,
            team: {
              team_name: user.team?.team_name || 'Unknown'
            }
          }
        };
      }
      
      // Calculate streak bonuses
      const { streak3Bonus, streak5Bonus } = calculateStreakBonuses(userDailyData, challenge_day);
      
      // Calculate final runs with Power Play and streak bonuses
      const finalRuns = calculateFinalRuns(currentDayData.runs, challenge_day, streak3Bonus, streak5Bonus);
      
      // Enhanced debug logging: Calculate daily runs array for one test user (e.g., first user with data)
      if (user.user_id === allUsers.find(u => dataMap.has(u.user_id))?.user_id) {
        const completedDays = [
          isDayCompleted(userDailyData.get(1)?.steps),
          isDayCompleted(userDailyData.get(2)?.steps),
          isDayCompleted(userDailyData.get(3)?.steps),
          isDayCompleted(userDailyData.get(4)?.steps),
          isDayCompleted(userDailyData.get(5)?.steps)
        ];
        
        // Find which day gets the 3-day streak award
        let threeDayStreakAwardDay = null;
        if (completedDays[0] && completedDays[1] && completedDays[2]) {
          threeDayStreakAwardDay = 3;
        } else if (completedDays[1] && completedDays[2] && completedDays[3]) {
          threeDayStreakAwardDay = 4;
        } else if (completedDays[2] && completedDays[3] && completedDays[4]) {
          threeDayStreakAwardDay = 5;
        }
        
        const allFiveCompleted = completedDays[0] && completedDays[1] && completedDays[2] && completedDays[3] && completedDays[4];
        
        // Calculate daily runs array
        const dailyRuns = [];
        for (let day = 1; day <= 5; day++) {
          const dayData = userDailyData.get(day);
          if (dayData && dayData.steps !== null) {
            const baseRuns = dayData.runs || 0;
            const dayStreak3 = (threeDayStreakAwardDay === day) ? 10 : 0;
            const dayStreak5 = (day === 5 && allFiveCompleted) ? 20 : 0;
            let runs = baseRuns;
            if (day === 3) runs = runs * 2; // Power Play
            runs = runs + dayStreak3 + dayStreak5;
            dailyRuns.push(runs);
          } else {
            dailyRuns.push(0);
          }
        }
        
        console.log("Streak debug for user", user.user_id, {
          dailyRuns,
          completedDays,
          threeDayStreakAwardDay,
          fiveDayStreak: allFiveCompleted
        });
      }
      
      return {
        user_id: user.user_id,
        user_name: user.name,
        team_id: user.team_id,
        team_name: user.team?.team_name || 'Unknown',
        steps: currentDayData.steps,
        runs: finalRuns,
        user: {
          name: user.name,
          team_id: user.team_id,
          team: {
            team_name: user.team?.team_name || 'Unknown'
          }
        }
      };
    });
    
    // Step 5: Sort by runs DESC (nulls last), steps DESC (nulls last), user_name ASC
    leaderboard.sort((a, b) => {
      // Handle null values (nulls go to the end)
      if (a.runs === null && b.runs === null) {
        if (a.steps === null && b.steps === null) {
          return a.user_name.localeCompare(b.user_name);
        }
        if (a.steps === null) return 1;
        if (b.steps === null) return -1;
        return b.steps - a.steps;
      }
      if (a.runs === null) return 1;
      if (b.runs === null) return -1;
      
      if (b.runs !== a.runs) return b.runs - a.runs;
      
      if (a.steps === null && b.steps === null) {
        return a.user_name.localeCompare(b.user_name);
      }
      if (a.steps === null) return 1;
      if (b.steps === null) return -1;
      
      if (b.steps !== a.steps) return b.steps - a.steps;
      return a.user_name.localeCompare(b.user_name);
    });
    
    console.log(`[Leaderboard] Returning ${leaderboard.length} users for date ${date}`);
    return leaderboard;
  } catch (error) {
    console.error('[Leaderboard] Error in getIndividualLeaderboard:', error);
    throw new Error(`Failed to get individual leaderboard: ${error.message}`);
  }
};

/**
 * Get team leaderboard for a specific date
 * ALWAYS returns all 8 teams, with null values if no data exists
 * Recalculates team totals from enhanced individual runs (with Power Play and bonuses)
 * @param {Date|string} date - The date to query
 * @returns {Array} Sorted team leaderboard entries (all 8 teams)
 */
const getTeamLeaderboard = async (date) => {
  try {
    // Parse date and create date range (UTC to avoid timezone issues)
    let queryDate;
    if (typeof date === 'string') {
      // Parse YYYY-MM-DD format
      const [year, month, day] = date.split('-').map(Number);
      queryDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      queryDate = new Date(date);
    }
    
    const challenge_day = detectChallengeDay(queryDate);
    
    // Create start and end of day in UTC
    const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59, 999));
    
    console.log(`[Leaderboard] Querying team leaderboard for date: ${date}, challenge_day: ${challenge_day}`);
    console.log(`[Leaderboard] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    // Step 1: Get ALL 8 teams
    const allTeams = await prisma.teams.findMany({
      orderBy: {
        team_id: 'asc'
      }
    });
    
    // Step 2: Get individual leaderboard with enhanced scoring (includes bonuses)
    const individualLeaderboard = await getIndividualLeaderboard(date);
    
    // Step 3: Calculate team totals from enhanced individual runs
    const teamTotals = new Map();
    
    // Initialize all teams with zeros
    allTeams.forEach(team => {
      teamTotals.set(team.team_id, {
        total_steps: 0,
        total_runs: 0,
        memberCount: 0
      });
    });
    
    // Sum up individual runs and steps by team
    for (const individual of individualLeaderboard) {
      if (individual.steps !== null && individual.runs !== null) {
        const teamData = teamTotals.get(individual.team_id);
        if (teamData) {
          teamData.total_steps += individual.steps || 0;
          teamData.total_runs += individual.runs || 0;
          teamData.memberCount += 1;
        }
      }
    }
    
    // Step 4: Build complete leaderboard with all 8 teams
    const leaderboard = allTeams.map(team => {
      const teamData = teamTotals.get(team.team_id);
      const hasData = teamData && teamData.memberCount > 0;
      
      return {
        team_id: team.team_id,
        team_name: team.team_name,
        total_steps: hasData ? teamData.total_steps : null,
        total_runs: hasData ? teamData.total_runs : null,
        team: {
          team_name: team.team_name
        }
      };
    });
    
    // Step 5: Sort by total_runs DESC (nulls last), total_steps DESC (nulls last)
    leaderboard.sort((a, b) => {
      // Handle null values (nulls go to the end)
      if (a.total_runs === null && b.total_runs === null) {
        if (a.total_steps === null && b.total_steps === null) return 0;
        if (a.total_steps === null) return 1;
        if (b.total_steps === null) return -1;
        return b.total_steps - a.total_steps;
      }
      if (a.total_runs === null) return 1;
      if (b.total_runs === null) return -1;
      
      if (b.total_runs !== a.total_runs) return b.total_runs - a.total_runs;
      
      if (a.total_steps === null && b.total_steps === null) return 0;
      if (a.total_steps === null) return 1;
      if (b.total_steps === null) return -1;
      
      return b.total_steps - a.total_steps;
    });
    
    console.log(`[Leaderboard] Returning ${leaderboard.length} teams for date ${date}`);
    return leaderboard;
  } catch (error) {
    console.error('[Leaderboard] Error in getTeamLeaderboard:', error);
    throw new Error(`Failed to get team leaderboard: ${error.message}`);
  }
};

/**
 * Get aggregated individual leaderboard across all challenge days (Day 1-5)
 * ALWAYS returns all 56 users, sums available days with enhanced scoring (Power Play + bonuses)
 * @returns {Array} Sorted aggregated leaderboard entries (all 56 users)
 */
const getAggregatedIndividualLeaderboard = async () => {
  try {
    console.log('[Leaderboard] Querying aggregated individual leaderboard');
    
    // Step 1: Get ALL 56 users with their team information
    const allUsers = await prisma.users.findMany({
      include: {
        team: {
          select: {
            team_name: true
          }
        }
      },
      orderBy: {
        user_id: 'asc'
      }
    });
    
    // Step 2: Query all leaderboard entries for challenge days 1-5
    const allEntries = await prisma.leaderboard_individual.findMany({
      where: {
        challenge_day: {
          in: [1, 2, 3, 4, 5]
        }
      },
      include: {
        user: {
          include: {
            team: {
              select: {
                team_name: true
              }
            }
          }
        }
      }
    });
    
    // Step 3: Organize entries by user and day
    const userDayMap = new Map(); // user_id -> Map(challenge_day -> { steps, runs })
    
    for (const entry of allEntries) {
      const userId = entry.user_id;
      if (!userDayMap.has(userId)) {
        userDayMap.set(userId, new Map());
      }
      userDayMap.get(userId).set(entry.challenge_day, {
        steps: entry.steps,
        runs: entry.runs || 0
      });
    }
    
    // Step 4: Calculate aggregated totals with enhanced scoring for each user
    const userAggregates = new Map();
    
    for (const user of allUsers) {
      const userDayData = userDayMap.get(user.user_id) || new Map();
      
      let totalSteps = 0;
      let totalRuns = 0;
      let hasAnyData = false;
      
      // Process each day 1-5
      for (let day = 1; day <= 5; day++) {
        const dayData = userDayData.get(day);
        if (dayData && dayData.steps !== null) {
          hasAnyData = true;
          totalSteps += dayData.steps || 0;
          
          // Calculate enhanced runs for this day (with Power Play and bonuses)
          const { streak3Bonus, streak5Bonus } = calculateStreakBonuses(userDayData, day);
          const finalRuns = calculateFinalRuns(dayData.runs, day, streak3Bonus, streak5Bonus);
          
          if (finalRuns !== null) {
            totalRuns += finalRuns;
          }
        }
      }
      
      if (hasAnyData) {
        userAggregates.set(user.user_id, {
          steps: totalSteps,
          runs: totalRuns
        });
      }
    }
    
    // Step 5: Build complete leaderboard with all 56 users
    const leaderboard = allUsers.map(user => {
      const aggregate = userAggregates.get(user.user_id);
      return {
        user_id: user.user_id,
        user_name: user.name,
        team_id: user.team_id,
        team_name: user.team?.team_name || 'Unknown',
        steps: aggregate ? aggregate.steps : null,
        runs: aggregate ? aggregate.runs : null,
        user: {
          name: user.name,
          team_id: user.team_id,
          team: {
            team_name: user.team?.team_name || 'Unknown'
          }
        }
      };
    });
    
    // Step 5: Sort by runs DESC (nulls last), steps DESC (nulls last), user_name ASC
    leaderboard.sort((a, b) => {
      // Handle null values (nulls go to the end)
      if (a.runs === null && b.runs === null) {
        if (a.steps === null && b.steps === null) {
          return a.user_name.localeCompare(b.user_name);
        }
        if (a.steps === null) return 1;
        if (b.steps === null) return -1;
        return b.steps - a.steps;
      }
      if (a.runs === null) return 1;
      if (b.runs === null) return -1;
      
      if (b.runs !== a.runs) return b.runs - a.runs;
      
      if (a.steps === null && b.steps === null) {
        return a.user_name.localeCompare(b.user_name);
      }
      if (a.steps === null) return 1;
      if (b.steps === null) return -1;
      
      if (b.steps !== a.steps) return b.steps - a.steps;
      return a.user_name.localeCompare(b.user_name);
    });
    
    console.log(`[Leaderboard] Returning aggregated leaderboard for ${leaderboard.length} users`);
    return leaderboard;
  } catch (error) {
    console.error('[Leaderboard] Error in getAggregatedIndividualLeaderboard:', error);
    throw new Error(`Failed to get aggregated individual leaderboard: ${error.message}`);
  }
};

/**
 * Get aggregated team leaderboard across all challenge days (Day 1-5)
 * ALWAYS returns all 8 teams, sums available days with enhanced scoring (Power Play + bonuses)
 * Recalculates from enhanced individual leaderboard
 * @returns {Array} Sorted aggregated team leaderboard entries (all 8 teams)
 */
const getAggregatedTeamLeaderboard = async () => {
  try {
    console.log('[Leaderboard] Querying aggregated team leaderboard');
    
    // Step 1: Get ALL 8 teams
    const allTeams = await prisma.teams.findMany({
      orderBy: {
        team_id: 'asc'
      }
    });
    
    // Step 2: Get aggregated individual leaderboard with enhanced scoring
    const individualLeaderboard = await getAggregatedIndividualLeaderboard();
    
    // Step 3: Calculate team totals from enhanced individual runs
    const teamTotals = new Map();
    
    // Initialize all teams with zeros
    allTeams.forEach(team => {
      teamTotals.set(team.team_id, {
        total_steps: 0,
        total_runs: 0,
        memberCount: 0
      });
    });
    
    // Sum up individual runs and steps by team
    for (const individual of individualLeaderboard) {
      if (individual.steps !== null && individual.runs !== null) {
        const teamData = teamTotals.get(individual.team_id);
        if (teamData) {
          teamData.total_steps += individual.steps || 0;
          teamData.total_runs += individual.runs || 0;
          teamData.memberCount += 1;
        }
      }
    }
    
    // Step 4: Build complete leaderboard with all 8 teams
    const leaderboard = allTeams.map(team => {
      const teamData = teamTotals.get(team.team_id);
      const hasData = teamData && teamData.memberCount > 0;
      
      return {
        team_id: team.team_id,
        team_name: team.team_name,
        total_steps: hasData ? teamData.total_steps : null,
        total_runs: hasData ? teamData.total_runs : null,
        team: {
          team_name: team.team_name
        }
      };
    });
    
    // Step 5: Sort by total_runs DESC (nulls last), total_steps DESC (nulls last)
    leaderboard.sort((a, b) => {
      // Handle null values (nulls go to the end)
      if (a.total_runs === null && b.total_runs === null) {
        if (a.total_steps === null && b.total_steps === null) return 0;
        if (a.total_steps === null) return 1;
        if (b.total_steps === null) return -1;
        return b.total_steps - a.total_steps;
      }
      if (a.total_runs === null) return 1;
      if (b.total_runs === null) return -1;
      
      if (b.total_runs !== a.total_runs) return b.total_runs - a.total_runs;
      
      if (a.total_steps === null && b.total_steps === null) return 0;
      if (a.total_steps === null) return 1;
      if (b.total_steps === null) return -1;
      
      return b.total_steps - a.total_steps;
    });
    
    console.log(`[Leaderboard] Returning aggregated leaderboard for ${leaderboard.length} teams`);
    return leaderboard;
  } catch (error) {
    console.error('[Leaderboard] Error in getAggregatedTeamLeaderboard:', error);
    throw new Error(`Failed to get aggregated team leaderboard: ${error.message}`);
  }
};

module.exports = {
  getIndividualLeaderboard,
  getTeamLeaderboard,
  getAggregatedIndividualLeaderboard,
  getAggregatedTeamLeaderboard
};

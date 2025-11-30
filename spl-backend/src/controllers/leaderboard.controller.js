const leaderboardService = require('../services/leaderboard.service');

/**
 * Get individual leaderboard for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getIndividualLeaderboard = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Pass date string, not Date object (for consistent UTC parsing)
    const leaderboard = await leaderboardService.getIndividualLeaderboard(date);

    res.json({
      success: true,
      date: date,
      count: leaderboard.length,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user_id: entry.user_id,
        user_name: entry.user_name || entry.user?.name || 'Unknown',
        team_id: entry.team_id || entry.user?.team_id,
        team_name: entry.team_name || entry.user?.team?.team_name || 'Unknown',
        steps: entry.steps,
        runs: entry.runs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team leaderboard for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTeamLeaderboard = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Pass date string, not Date object (for consistent UTC parsing)
    const leaderboard = await leaderboardService.getTeamLeaderboard(date);

    res.json({
      success: true,
      date: date,
      count: leaderboard.length,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        team_id: entry.team_id,
        team_name: entry.team_name || entry.team?.team_name || 'Unknown',
        total_steps: entry.total_steps,
        total_runs: entry.total_runs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated individual leaderboard (sum of all days)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAggregatedIndividualLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getAggregatedIndividualLeaderboard();

    res.json({
      success: true,
      type: 'aggregate',
      count: leaderboard.length,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user_id: entry.user_id,
        user_name: entry.user_name || entry.user?.name || 'Unknown',
        team_id: entry.team_id || entry.user?.team_id || 'Unknown',
        team_name: entry.team_name || entry.user?.team?.team_name || 'Unknown',
        steps: entry.steps,
        runs: entry.runs
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated team leaderboard (sum of all days)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAggregatedTeamLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await leaderboardService.getAggregatedTeamLeaderboard();

    res.json({
      success: true,
      type: 'aggregate',
      count: leaderboard.length,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        team_id: entry.team_id,
        team_name: entry.team_name || entry.team?.team_name || 'Unknown',
        total_steps: entry.total_steps,
        total_runs: entry.total_runs
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIndividualLeaderboard,
  getTeamLeaderboard,
  getAggregatedIndividualLeaderboard,
  getAggregatedTeamLeaderboard
};


const adminService = require('../services/admin.service');

/**
 * Get all raw uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRawUploads = async (req, res, next) => {
  try {
    const uploads = await adminService.getRawUploads();
    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    console.error('[Admin Controller] Error in getDailySteps:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily steps',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get daily steps for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDailySteps = async (req, res, next) => {
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

    const steps = await adminService.getDailySteps(date); // Pass string, not Date object

    res.json({
      success: true,
      date: date,
      count: steps.length,
      data: steps
    });
  } catch (error) {
    console.error('[Admin Controller] Error in getDailySteps:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily steps',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get leaderboard preview for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLeaderboardPreview = async (req, res, next) => {
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

    const preview = await adminService.getLeaderboardPreview(date); // Pass string, not Date object

    res.json({
      success: true,
      ...preview
    });
  } catch (error) {
    console.error('[Admin Controller] Error in getDailySteps:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily steps',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Publish leaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const publishLeaderboard = async (req, res, next) => {
  try {
    const { date, leaderboardData } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    if (!leaderboardData) {
      return res.status(400).json({
        success: false,
        message: 'Leaderboard data is required'
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

    const published = await adminService.publishLeaderboard(date, leaderboardData); // Pass string, not Date object

    res.json({
      success: true,
      message: 'Leaderboard published successfully',
      data: {
        id: published.id,
        date: published.date,
        publishedAt: published.publishedAt
      }
    });
  } catch (error) {
    console.error('[Admin Controller] Error in getDailySteps:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get daily steps',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getRawUploads,
  getDailySteps,
  getLeaderboardPreview,
  publishLeaderboard
};


const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const adminService = require('../services/admin.service');

// Routes
router.get('/individual', leaderboardController.getIndividualLeaderboard);
router.get('/team', leaderboardController.getTeamLeaderboard);
router.get('/individual/aggregate', leaderboardController.getAggregatedIndividualLeaderboard);
router.get('/team/aggregate', leaderboardController.getAggregatedTeamLeaderboard);

// Published leaderboard endpoint (for public-facing website)
router.get('/published', async (req, res, next) => {
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

    const published = await adminService.getPublishedLeaderboard(date); // Pass string, not Date object

    // Always return success (never return 404)
    // getPublishedLeaderboard always returns data (all users/teams, with null values if no data)
    res.json({
      success: true,
      date: date,
      publishedAt: published.publishedAt,
      data: published.jsonData || { individual: [], team: [] }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


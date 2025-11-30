const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Routes
router.get('/uploads', adminController.getRawUploads);
router.get('/steps', adminController.getDailySteps);
router.get('/leaderboard', adminController.getLeaderboardPreview);
router.post('/publish', adminController.publishLeaderboard);

module.exports = router;


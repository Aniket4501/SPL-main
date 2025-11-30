const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const uploadRoutes = require('./upload.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const adminRoutes = require('./admin.routes');

// Mount routes
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/upload', uploadRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/admin', adminRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SPL Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      upload: '/api/upload',
      leaderboard: '/api/leaderboard',
      uploadAdmin: '/api/upload/admin/upload (POST)',
      uploadTest: '/api/upload/test (GET)'
    }
  });
});

module.exports = router;


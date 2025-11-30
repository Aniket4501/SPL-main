const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').optional().trim(),
    body('authorId').isUUID().withMessage('Valid authorId is required')
  ],
  validate,
  postController.createPost
);
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('content').optional().trim()
  ],
  validate,
  postController.updatePost
);
router.delete('/:id', postController.deletePost);

module.exports = router;


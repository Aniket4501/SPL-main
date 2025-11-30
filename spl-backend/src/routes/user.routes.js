const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
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
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 1 })
  ],
  validate,
  userController.createUser
);
router.put(
  '/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 1 })
  ],
  validate,
  userController.updateUser
);
router.delete('/:id', userController.deleteUser);

module.exports = router;


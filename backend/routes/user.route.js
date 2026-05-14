const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);

router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 80 }),
    body('profilePhoto').optional({ nullable: true }).isString().isLength({ max: 500 }),
  ],
  validate,
  updateProfile
);

router.put(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  changePassword
);

module.exports = router;

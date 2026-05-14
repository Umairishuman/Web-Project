const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me,
} = require('../controllers/auth.controller');

const router = express.Router();

const passwordRules = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    passwordRules,
    body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    body('rememberMe').optional().isBoolean(),
  ],
  validate,
  login
);

router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [passwordRules],
  validate,
  resetPassword
);

module.exports = router;

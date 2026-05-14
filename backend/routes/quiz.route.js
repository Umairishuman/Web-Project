const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createQuiz,
  getQuizById,
  updateQuiz,
  publishQuiz,
  getQuizzesByClass,
  getQuizResults,
  getQuizAnalytics,
} = require('../controllers/quiz.controller');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    body('classId').isMongoId().withMessage('Invalid class id'),
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('timeLimit').isInt({ min: 1, max: 600 }).withMessage('Time limit must be 1–600 minutes'),
    body('scheduledAt').isISO8601().withMessage('scheduledAt must be a valid date'),
    body('closesAt').isISO8601().withMessage('closesAt must be a valid date'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  createQuiz
);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid quiz id')],
  validate,
  getQuizById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    param('id').isMongoId().withMessage('Invalid quiz id'),
    body('title').optional().isString().isLength({ max: 200 }),
    body('timeLimit').optional().isInt({ min: 1, max: 600 }),
    body('scheduledAt').optional().isISO8601(),
    body('closesAt').optional().isISO8601(),
  ],
  validate,
  updateQuiz
);

router.patch(
  '/:id/publish',
  authMiddleware,
  roleMiddleware('teacher'),
  [param('id').isMongoId().withMessage('Invalid quiz id')],
  validate,
  publishQuiz
);

router.get(
  '/class/:classId',
  authMiddleware,
  [param('classId').isMongoId().withMessage('Invalid class id')],
  validate,
  getQuizzesByClass
);

router.get(
  '/:id/results',
  authMiddleware,
  roleMiddleware('teacher', 'admin'),
  [param('id').isMongoId().withMessage('Invalid quiz id')],
  validate,
  getQuizResults
);

router.get(
  '/:id/analytics',
  authMiddleware,
  roleMiddleware('teacher', 'admin'),
  [param('id').isMongoId().withMessage('Invalid quiz id')],
  validate,
  getQuizAnalytics
);

module.exports = router;

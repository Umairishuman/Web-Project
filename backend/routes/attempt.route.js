const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  startAttempt,
  submitAttempt,
  getAttemptById,
  gradeAttempt,
  getMyAttempts,
} = require('../controllers/attempt.controller');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  [body('quizId').isMongoId().withMessage('Invalid quiz id')],
  validate,
  startAttempt
);

router.get('/me', authMiddleware, roleMiddleware('student'), getMyAttempts);

router.put(
  '/:id/submit',
  authMiddleware,
  roleMiddleware('student'),
  [
    param('id').isMongoId().withMessage('Invalid attempt id'),
    body('answers').isArray().withMessage('answers must be an array'),
  ],
  validate,
  submitAttempt
);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid attempt id')],
  validate,
  getAttemptById
);

router.patch(
  '/:id/grade',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    param('id').isMongoId().withMessage('Invalid attempt id'),
    body('grading').isArray().withMessage('grading must be an array'),
  ],
  validate,
  gradeAttempt
);

module.exports = router;

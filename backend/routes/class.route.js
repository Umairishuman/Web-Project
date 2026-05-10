const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createClass,
  getTeacherClasses,
  getClassById,
  getClassStudents,
  joinClass,
  getStudentClasses,
  removeStudent,
  createAnnouncement,
  createComment,
} = require('../controllers/class.controller');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    body('name').trim().notEmpty().withMessage('Class name is required').isLength({ max: 120 }),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 80 }),
    body('description').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  createClass
);

router.get('/', authMiddleware, roleMiddleware('teacher'), getTeacherClasses);

router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid class id')],
  validate,
  getClassById
);

router.get(
  '/:id/students',
  authMiddleware,
  roleMiddleware('teacher', 'admin'),
  [param('id').isMongoId().withMessage('Invalid class id')],
  validate,
  getClassStudents
);

router.post(
  '/join',
  authMiddleware,
  roleMiddleware('student'),
  [
    body('joinCode')
      .trim()
      .notEmpty()
      .withMessage('Join code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Join code must be 6 characters'),
  ],
  validate,
  joinClass
);

router.get('/student/my', authMiddleware, roleMiddleware('student'), getStudentClasses);

router.delete(
  '/:id/students/:studentId',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    param('id').isMongoId().withMessage('Invalid class id'),
    param('studentId').isMongoId().withMessage('Invalid student id'),
  ],
  validate,
  removeStudent
);

router.post(
  '/:id/announcements',
  authMiddleware,
  roleMiddleware('teacher'),
  [
    param('id').isMongoId().withMessage('Invalid class id'),
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 5000 }),
    body('isAnonymous').optional().isBoolean(),
  ],
  validate,
  createAnnouncement
);

router.post(
  '/:id/announcements/:annId/comments',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid class id'),
    param('annId').isMongoId().withMessage('Invalid announcement id'),
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 2000 }),
    body('isAnonymous').optional().isBoolean(),
  ],
  validate,
  createComment
);

module.exports = router;

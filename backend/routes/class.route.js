const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
  createClass,
  getTeacherClasses,
  getClassById,
  joinClass,
  getStudentClasses,
  removeStudent,
  createAnnouncement,
  createComment,
} = require('../controllers/class.controller');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('teacher'), createClass);
router.get('/', authMiddleware, roleMiddleware('teacher'), getTeacherClasses);
router.get('/:id', authMiddleware, getClassById);
router.post('/join', authMiddleware, roleMiddleware('student'), joinClass);
router.get('/student/my', authMiddleware, roleMiddleware('student'), getStudentClasses);
router.delete('/:id/students/:studentId', authMiddleware, roleMiddleware('teacher'), removeStudent);
router.post('/:id/announcements', authMiddleware, roleMiddleware('teacher'), createAnnouncement);
router.post('/:id/announcements/:annId/comments', authMiddleware, createComment);

module.exports = router;

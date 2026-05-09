const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const {
  createQuiz,
  getQuizById,
  updateQuiz,
  publishQuiz,
  getQuizzesByClass,
  getQuizResults,
} = require('../controllers/quiz.controller');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('teacher'), createQuiz);
router.get('/:id', authMiddleware, getQuizById);
router.put('/:id', authMiddleware, roleMiddleware('teacher'), updateQuiz);
router.patch('/:id/publish', authMiddleware, roleMiddleware('teacher'), publishQuiz);
router.get('/class/:classId', authMiddleware, getQuizzesByClass);
router.get('/:id/results', authMiddleware, roleMiddleware('teacher'), getQuizResults);

module.exports = router;

const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { startAttempt, submitAttempt, getAttemptById, gradeAttempt } = require('../controllers/attempt.controller');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('student'), startAttempt);
router.put('/:id/submit', authMiddleware, roleMiddleware('student'), submitAttempt);
router.get('/:id', authMiddleware, getAttemptById);
router.patch('/:id/grade', authMiddleware, roleMiddleware('teacher'), gradeAttempt);

module.exports = router;

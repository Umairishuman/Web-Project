const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  getUsers,
  toggleUserStatus,
  changeUserRole,
  getStats,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/users', getUsers);

router.patch(
  '/users/:id/status',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validate,
  toggleUserStatus
);

router.patch(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  ],
  validate,
  changeUserRole
);

router.get('/stats', getStats);

module.exports = router;

const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { getUsers, toggleUserStatus, changeUserRole, getStats } = require('../controllers/admin.controller');

const router = express.Router();

router.get('/users', authMiddleware, roleMiddleware('admin'), getUsers);
router.patch('/users/:id/status', authMiddleware, roleMiddleware('admin'), toggleUserStatus);
router.patch('/users/:id/role', authMiddleware, roleMiddleware('admin'), changeUserRole);
router.get('/stats', authMiddleware, roleMiddleware('admin'), getStats);

module.exports = router;

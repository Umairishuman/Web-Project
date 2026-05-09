const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
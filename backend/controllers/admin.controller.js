const User = require('../models/user.model');
const Class = require('../models/class.model');
const Quiz = require('../models/quiz.model');
const Attempt = require('../models/attempt.model');

const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role && ['admin', 'teacher', 'student'].includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user: { _id: user._id, isActive: user.isActive } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (id === req.user._id.toString() && role !== 'admin') {
      return res
        .status(400)
        .json({ success: false, message: 'You cannot demote your own admin account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'Role updated',
      data: { user: { _id: user._id, role: user.role } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStats = async (_req, res) => {
  try {
    const [totalUsers, totalClasses, totalQuizzes, activeUsers, students, teachers, admins, totalAttempts] =
      await Promise.all([
        User.countDocuments(),
        Class.countDocuments(),
        Quiz.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        User.countDocuments({ role: 'admin' }),
        Attempt.countDocuments({ submittedAt: { $ne: null } }),
      ]);

    const recentUsers = await User.find()
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClasses,
        totalQuizzes,
        activeUsers,
        totalAttempts,
        roles: { admins, teachers, students },
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, toggleUserStatus, changeUserRole, getStats };

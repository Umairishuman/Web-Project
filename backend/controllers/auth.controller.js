const User = require('../models/user.model');
const PasswordReset = require('../models/passwordReset.model');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { buildCookieOptions, clearCookieOptions } = require('../utils/cookieOptions');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email, passwordHash: password, role });
    await user.save();

    const token = generateToken(user._id);
    res.cookie('token', token, buildCookieOptions(false));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, !!rememberMe);
    res.cookie('token', token, buildCookieOptions(!!rememberMe));

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto || null,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (_req, res) => {
  res.clearCookie('token', clearCookieOptions());
  res.json({ success: true, message: 'Logout successful' });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond success to avoid leaking which emails are registered
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.deleteMany({ userId: user._id });
    await new PasswordReset({ userId: user._id, token, expiresAt }).save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0F172A">
        <h2 style="color:#0D9488">Reset your ExamGuard password</h2>
        <p>We received a request to reset your password. Click below to choose a new one:</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#0D9488;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
        <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Reset your ExamGuard password', html);
    } catch (mailErr) {
      console.error('Email send failed:', mailErr.message);
      // Don't reveal mail errors to client; user-facing message stays generic
    }

    res.json({ success: true, message: 'If email exists, reset link sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordReset) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findById(passwordReset.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    user.passwordHash = password;
    await user.save();

    passwordReset.used = true;
    await passwordReset.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePhoto: req.user.profilePhoto || null,
      },
    },
  });
};

module.exports = { register, login, logout, forgotPassword, resetPassword, me };

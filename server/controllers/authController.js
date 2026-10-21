const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const formatValidationErrors = (result) => result.array().map(({ path, param, msg, location }) => ({
  field: path || param,
  location,
  message: msg,
}));

// Helper to generate JWT
const generateToken = (user) => {
  const payload = { id: user._id, role: user.role };
  const expiresIn = '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const authCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// @route   POST /api/auth/register
// @desc    Register a student or administrator account
exports.register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Account type must be student or admin'),
  body('studentId').optional().trim(),
  body('department').optional().trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: formatValidationErrors(errors) });
      }
      const { name, password, studentId, department } = req.body;
      const email = req.body.email.trim().toLowerCase();
      const role = req.body.role || 'student';

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name: name.trim(),
        email,
        passwordHash,
        role,
        ...(role === 'student' && { studentId, department }),
      });
      await user.save();

      const token = generateToken(user);
      res.cookie('token', token, authCookieOptions());
      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

// @route   POST /api/auth/login
exports.login = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: formatValidationErrors(errors) });
      }
      const email = req.body.email.trim().toLowerCase();
      const { password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.cookie('token', token, authCookieOptions());
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out' });
};

// @route   GET /api/auth/me
// @route   PUT /api/auth/me
exports.updateProfile = [
  // Validate allowed fields
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('studentId').optional().trim(),
  body('department').optional().trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: formatValidationErrors(errors) });
      }

      const updates = {};
      const { name, email, password } = req.body;
      if (name) updates.name = name;
      if (email) updates.email = email.trim().toLowerCase();
      if (req.body.studentId !== undefined) updates.studentId = req.body.studentId;
      if (req.body.department !== undefined) updates.department = req.body.department;
      if (password) {
        const salt = await bcrypt.genSalt(12);
        updates.passwordHash = await bcrypt.hash(password, salt);
      }

      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      }).select('-passwordHash');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'Profile updated', user });
    } catch (err) {
      next(err);
    }
  }
];

exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

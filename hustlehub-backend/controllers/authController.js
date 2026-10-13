const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');

// ─── Helper: issue JWT ─────────────────────────────────────────────────────────

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '2h' }
  );

// ─── Register ──────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'User with this email already exists.' });
    }

    // Admin role cannot be self-assigned via public API
    const allowedRole = role === 'admin' ? 'freelancer' : (role || 'freelancer');

    const user = await User.create({ name, email, password, role: allowedRole });

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Profile ───────────────────────────────────────────────────────────────

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User profile not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalEarnings: user.totalEarnings,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

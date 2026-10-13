const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', authLimiter, registerValidationRules(), validate, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidationRules(), validate, authController.login);

// GET /api/auth/profile  (protected)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validate');

router.post('/register', registerValidationRules(), validate, authController.register);
router.post('/login', loginValidationRules(), validate, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;

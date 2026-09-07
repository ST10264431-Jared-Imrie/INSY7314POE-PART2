const { body, validationResult } = require('express-validator');

const registerValidationRules = () => [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.').matches(/\d/).withMessage('Password must contain at least one number.').matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter.'),
  body('role').optional().isIn(['freelancer', 'client']).withMessage('Role must be either freelancer or client.')
];

const loginValidationRules = () => [
  body('email').trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extractedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
  return res.status(400).json({ status: 'fail', message: 'Input validation failed', errors: extractedErrors });
};

module.exports = { registerValidationRules, loginValidationRules, validate };

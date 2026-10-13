const { body, validationResult } = require('express-validator');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extractedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
  return res.status(400).json({ status: 'fail', message: 'Input validation failed.', errors: extractedErrors });
};

// ─── Auth Validators ───────────────────────────────────────────────────────────

const registerValidationRules = () => [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter.'),
  body('role')
    .optional()
    .isIn(['freelancer', 'client']).withMessage('Role must be either freelancer or client.')
];

const loginValidationRules = () => [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

// ─── Gig Validators ────────────────────────────────────────────────────────────

const createGigValidationRules = () => [
  body('title')
    .trim()
    .notEmpty().withMessage('Gig title is required.')
    .isLength({ min: 5, max: 120 }).withMessage('Title must be between 5 and 120 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Gig description is required.')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters.'),
  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 1, max: 100000 }).withMessage('Price must be a number between 1 and 100,000.')
];

const updateGigValidationRules = () => [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 120 }).withMessage('Title must be between 5 and 120 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters.'),
  body('price')
    .optional()
    .isFloat({ min: 1, max: 100000 }).withMessage('Price must be a number between 1 and 100,000.')
];

// ─── Booking Validators ────────────────────────────────────────────────────────

const createBookingValidationRules = () => [
  body('gigId')
    .notEmpty().withMessage('Gig ID is required.')
    .isMongoId().withMessage('Invalid Gig ID format.')
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  createGigValidationRules,
  updateGigValidationRules,
  createBookingValidationRules
};

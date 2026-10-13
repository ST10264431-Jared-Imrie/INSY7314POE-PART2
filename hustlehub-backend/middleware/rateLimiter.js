const rateLimit = require('express-rate-limit');

/**
 * authLimiter
 * Strict rate limiter for authentication endpoints (login/register).
 * Prevents brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * bookingLimiter
 * Moderate rate limiter for booking endpoints.
 * Prevents spam booking creation.
 */
const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many booking requests. Please slow down and try again later.'
  }
});

/**
 * apiLimiter
 * General API rate limiter applied globally.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later.'
  }
});

module.exports = { authLimiter, bookingLimiter, apiLimiter };

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createBookingValidationRules, validate } = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimiter');

// ─── Client Routes ────────────────────────────────────────────────────────────

// POST /api/bookings  — create a booking (client only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('client'),
  bookingLimiter,
  createBookingValidationRules(),
  validate,
  bookingController.createBooking
);

// GET /api/bookings/my  — client's own bookings
router.get('/my', authenticateToken, authorizeRoles('client'), bookingController.getMyBookings);

// ─── Freelancer Routes ────────────────────────────────────────────────────────

// GET /api/bookings/my-gigs  — bookings on freelancer's gigs
router.get('/my-gigs', authenticateToken, authorizeRoles('freelancer'), bookingController.getMyGigBookings);

// GET /api/bookings/earnings  — earnings summary for freelancer
router.get('/earnings', authenticateToken, authorizeRoles('freelancer'), bookingController.getEarnings);

// PATCH /api/bookings/:id/status  — update booking status (freelancer)
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('freelancer'),
  bookingController.updateBookingStatus
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/bookings  — all bookings (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), bookingController.getAllBookings);

module.exports = router;

const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createGigValidationRules,
  updateGigValidationRules,
  validate
} = require('../middleware/validate');

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/gigs  — browse all active gigs (public)
router.get('/', gigController.getAllGigs);

// ─── Protected: Freelancer Routes ─────────────────────────────────────────────

// GET /api/gigs/my  — view own gigs (freelancer only)
// NOTE: must be registered BEFORE '/:id' so 'my' is not treated as an id
router.get('/my', authenticateToken, authorizeRoles('freelancer'), gigController.getMyGigs);

// GET /api/gigs/:id  — view a single gig (public)
router.get('/:id', gigController.getGigById);

// POST /api/gigs  — create a gig (freelancer only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('freelancer'),
  createGigValidationRules(),
  validate,
  gigController.createGig
);

// PUT /api/gigs/:id  — update own gig (freelancer only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('freelancer'),
  updateGigValidationRules(),
  validate,
  gigController.updateGig
);

// DELETE /api/gigs/:id  — delete own gig (freelancer or admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('freelancer', 'admin'),
  gigController.deleteGig
);

module.exports = router;

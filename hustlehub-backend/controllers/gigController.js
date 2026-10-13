const Gig = require('../models/Gig');

// ─── GET /api/gigs  (public — all active gigs) ────────────────────────────────

exports.getAllGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ isActive: true })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: 'success', results: gigs.length, data: gigs });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/gigs/my  (freelancer — own gigs only) ───────────────────────────

exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ freelancer: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', results: gigs.length, data: gigs });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/gigs/:id  (public — single gig) ────────────────────────────────

exports.getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('freelancer', 'name email');
    if (!gig) {
      return res.status(404).json({ status: 'fail', message: 'Gig not found.' });
    }
    return res.status(200).json({ status: 'success', data: gig });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/gigs  (freelancer only) ───────────────────────────────────────

exports.createGig = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;

    const gig = await Gig.create({
      title,
      description,
      price,
      freelancer: req.user.id
    });

    return res.status(201).json({ status: 'success', message: 'Gig created successfully.', data: gig });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/gigs/:id  (freelancer — own gigs only) ─────────────────────────

exports.updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ status: 'fail', message: 'Gig not found.' });
    }

    // Ownership check — prevent modifying another freelancer's gig
    if (gig.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to modify this gig.' });
    }

    const { title, description, price, isActive } = req.body;
    if (title !== undefined) gig.title = title;
    if (description !== undefined) gig.description = description;
    if (price !== undefined) gig.price = price;
    if (isActive !== undefined) gig.isActive = isActive;

    const updated = await gig.save();
    return res.status(200).json({ status: 'success', message: 'Gig updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/gigs/:id  (freelancer — own gigs only, or admin) ────────────

exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ status: 'fail', message: 'Gig not found.' });
    }

    // Ownership check: freelancer must own the gig; admin can delete any
    if (req.user.role !== 'admin' && gig.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to delete this gig.' });
    }

    await gig.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Gig deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

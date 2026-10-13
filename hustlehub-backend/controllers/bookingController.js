const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const User = require('../models/User');

// ─── POST /api/bookings  (client only) ────────────────────────────────────────

exports.createBooking = async (req, res, next) => {
  try {
    const { gigId } = req.body;

    // Resolve the gig
    const gig = await Gig.findById(gigId).populate('freelancer', 'name email');
    if (!gig || !gig.isActive) {
      return res.status(404).json({ status: 'fail', message: 'Gig not found or no longer available.' });
    }

    // A freelancer cannot book their own gig
    if (gig.freelancer._id.toString() === req.user.id) {
      return res.status(400).json({ status: 'fail', message: 'You cannot book your own gig.' });
    }

    // Create the booking — the transaction record is auto-generated in schema
    // Payment is simulated: captured immediately with status 'paid'.
    const booking = await Booking.create({
      client: req.user.id,
      freelancer: gig.freelancer._id,
      gig: gig._id,
      amount: gig.price,
      paymentStatus: 'paid',
      transaction: {
        description: `Booking for gig: "${gig.title}"`
      }
    });

    // Update freelancer's total earnings
    await User.findByIdAndUpdate(gig.freelancer._id, {
      $inc: { totalEarnings: gig.price }
    });

    const populated = await booking.populate([
      { path: 'client', select: 'name email' },
      { path: 'freelancer', select: 'name email' },
      { path: 'gig', select: 'title description price' }
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Booking created successfully.',
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/bookings/my  (client — own bookings) ───────────────────────────

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate('gig', 'title description price')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: 'success', results: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/bookings/my-gigs  (freelancer — bookings on their gigs) ─────────

exports.getMyGigBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ freelancer: req.user.id })
      .populate('gig', 'title description price')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: 'success', results: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/bookings/earnings  (freelancer — total earnings summary) ────────

exports.getEarnings = async (req, res, next) => {
  try {
    // Aggregate income from bookings. Refunded (cancelled) bookings are
    // excluded from earnings so totals always reflect payable income.
    const result = await Booking.aggregate([
      { $match: { freelancer: require('mongoose').Types.ObjectId.createFromHexString(req.user.id) } },
      {
        $group: {
          _id: '$freelancer',
          totalEarnings: {
            $sum: { $cond: [{ $ne: ['$paymentStatus', 'refunded'] }, '$amount', 0] }
          },
          completedEarnings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          pendingEarnings: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'confirmed']] }, '$amount', 0]
            }
          },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const earnings = result[0] || {
      totalEarnings: 0,
      completedEarnings: 0,
      pendingEarnings: 0,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    return res.status(200).json({ status: 'success', data: earnings });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/bookings/:id/status  (freelancer — update booking status) ────

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found.' });
    }

    // Only the freelancer who owns the booking can change its status
    if (booking.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this booking.' });
    }

    // Cancelling refunds the simulated payment and reverses the tracked income;
    // re-activating a cancelled booking restores both.
    const wasCancelled = booking.status === 'cancelled';
    booking.status = status;

    if (status === 'cancelled' && !wasCancelled) {
      booking.paymentStatus = 'refunded';
      await User.findByIdAndUpdate(booking.freelancer, {
        $inc: { totalEarnings: -booking.amount }
      });
    } else if (status !== 'cancelled' && wasCancelled) {
      booking.paymentStatus = 'paid';
      await User.findByIdAndUpdate(booking.freelancer, {
        $inc: { totalEarnings: booking.amount }
      });
    }

    await booking.save();

    return res.status(200).json({ status: 'success', message: 'Booking status updated.', data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/bookings  (admin — all bookings) ───────────────────────────────

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('gig', 'title price')
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: 'success', results: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

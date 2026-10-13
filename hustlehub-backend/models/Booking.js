const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required.']
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required.']
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'Gig reference is required.']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0, 'Amount cannot be negative.']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message: 'Status must be pending, confirmed, completed, or cancelled.'
      },
      default: 'pending'
    },
    // Simulated payment state — 'paid' on booking creation (simulated capture),
    // switched to 'refunded' automatically when a booking is cancelled.
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: 'Payment status must be unpaid, paid, or refunded.'
      },
      default: 'paid'
    },
    // Embedded transaction record to satisfy "transaction record" requirement
    transaction: {
      transactionId: {
        type: String,
        default: () => `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String,
        default: ''
      }
    }
  },
  { timestamps: true }
);

// Compound index for querying bookings by client or freelancer
bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ freelancer: 1, createdAt: -1 });
bookingSchema.index({ gig: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gig title is required.'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters.'],
      maxlength: [120, 'Title cannot exceed 120 characters.']
    },
    description: {
      type: String,
      required: [true, 'Gig description is required.'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters.'],
      maxlength: [2000, 'Description cannot exceed 2000 characters.']
    },
    price: {
      type: Number,
      required: [true, 'Gig price is required.'],
      min: [1, 'Price must be at least 1.'],
      max: [100000, 'Price cannot exceed 100,000.']
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required.']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for fast freelancer-based queries
gigSchema.index({ freelancer: 1 });

module.exports = mongoose.model('Gig', gigSchema);

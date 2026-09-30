const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  date: {
    type: String, // Stored as ISO format string YYYY-MM-DD
    required: true,
    index: true
  },
  startTime: {
    type: String, // e.g. "10:00 AM"
    required: true
  },
  endTime: {
    type: String, // e.g. "11:30 AM"
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 3
  },
  bookedCount: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Compound index to guarantee vendor date-time slot uniqueness
slotSchema.index({ vendorId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);

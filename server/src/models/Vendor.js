const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  supportedVehicleTypes: [{
    type: String,
    enum: ['Car', 'Bike', 'Scooter'],
    required: true
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  businessHours: {
    openTime: { type: String, default: '09:00 AM' },
    closeTime: { type: String, default: '08:00 PM' }
  }
}, { timestamps: true });

// Geospatial index for distance queries & $near / $geoWithin
vendorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Vendor', vendorSchema);

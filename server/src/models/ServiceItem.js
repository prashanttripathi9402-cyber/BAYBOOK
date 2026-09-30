const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['General Service', 'Oil Change', 'Tyre Care', 'Detailing', 'Breakdown/Towing', 'Brake Repair', 'AC Service'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 60
  },
  applicableTo: [{
    type: String,
    enum: ['Car', 'Bike', 'Scooter'],
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('ServiceItem', serviceItemSchema);

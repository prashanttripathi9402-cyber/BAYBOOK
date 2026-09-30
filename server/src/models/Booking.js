const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  vehicleDetails: {
    vehicleType: { type: String, enum: ['Car', 'Bike', 'Scooter'], required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    regNumber: { type: String, required: true },
    fuelType: { type: String, default: 'Petrol' }
  },
  servicesBooked: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceItem' },
    title: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryMode: {
    type: String,
    enum: ['Doorstep Pickup & Drop', 'Self Visit'],
    default: 'Self Visit'
  },
  pickupDetails: {
    address: { type: String },
    contactPhone: { type: String }
  },
  bookingDate: {
    type: String,
    required: true
  },
  timeSlot: {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Vehicle Received', 'In Service', 'Ready for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  couponApplied: {
    code: { type: String },
    discountAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

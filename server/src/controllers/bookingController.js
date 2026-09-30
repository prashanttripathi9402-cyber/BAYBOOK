const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ServiceItem = require('../models/ServiceItem');
const Vendor = require('../models/Vendor');

// @desc    Create a new slot booking with atomic concurrency reservation
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      vendorId,
      vehicleDetails,
      serviceIds,
      slotId,
      deliveryMode,
      pickupDetails,
      couponCode
    } = req.body;

    if (!vendorId || !vehicleDetails || !serviceIds || !serviceIds.length || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields (vendorId, vehicleDetails, serviceIds, slotId)'
      });
    }

    // ATOMIC SLOT CONCURRENCY CHECK:
    // Atomically increment bookedCount ONLY IF bookedCount < capacity
    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        vendorId: vendorId,
        $expr: { $lt: ['$bookedCount', '$capacity'] }
      },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    // If slot is null, it means either slot not found OR slot capacity reached (sold out)
    if (!slot) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is fully booked or unavailable. Please choose another slot.'
      });
    }

    let bookingCreated = false;

    try {
      // Fetch verified service items from database to compute authoritative total
      const services = await ServiceItem.find({ _id: { $in: serviceIds }, vendorId });
      if (!services || services.length === 0) {
        throw new Error('Invalid service items selected');
      }

      let subtotal = services.reduce((sum, item) => sum + item.price, 0);
      let discountAmount = 0;

      // Handle sample coupons
      if (couponCode && couponCode.toUpperCase() === 'FIRST100') {
        discountAmount = Math.min(100, subtotal * 0.2);
      } else if (couponCode && couponCode.toUpperCase() === 'WELCOME20') {
        discountAmount = subtotal * 0.2;
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // Generate unique booking number: BK-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingNumber = `BK-${dateStr}-${randomSuffix}`;

      const booking = await Booking.create({
        bookingNumber,
        customerId: req.user.id,
        vendorId,
        vehicleDetails,
        servicesBooked: services.map(s => ({
          serviceId: s._id,
          title: s.title,
          price: s.price
        })),
        totalAmount,
        deliveryMode: deliveryMode || 'Self Visit',
        pickupDetails: deliveryMode === 'Doorstep Pickup & Drop' ? pickupDetails : undefined,
        bookingDate: slot.date,
        timeSlot: {
          slotId: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime
        },
        status: 'Confirmed',
        paymentStatus: 'Paid',
        couponApplied: couponCode ? { code: couponCode.toUpperCase(), discountAmount } : undefined
      });

      bookingCreated = true;

      const populatedBooking = await Booking.findById(booking._id)
        .populate('vendorId', 'businessName address location image averageRating')
        .populate('customerId', 'name email phone');

      res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully!',
        data: populatedBooking
      });
    } catch (innerError) {
      // Rollback slot capacity increment if booking creation fails
      if (!bookingCreated) {
        await Slot.findByIdAndUpdate(slotId, { $inc: { bookedCount: -1 } });
      }
      throw innerError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for current logged-in customer
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('vendorId', 'businessName address location totalReviews averageRating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vendorId', 'businessName address location ownerId')
      .populate('customerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Vendor / Admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Vendor / Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Vehicle Received', 'In Service', 'Ready for Delivery', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for vendor dashboard
// @route   GET /api/bookings/vendor/dashboard
// @access  Private (Vendor)
const getVendorDashboardBookings = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const bookings = await Booking.find({ vendorId: vendor._id })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getVendorDashboardBookings
};

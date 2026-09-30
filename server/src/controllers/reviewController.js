const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted after service completion' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking' });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user.id,
      vendorId: booking.vendorId,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a vendor
// @route   GET /api/reviews/vendor/:vendorId
// @access  Public
const getVendorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ vendorId: req.params.vendorId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getVendorReviews
};

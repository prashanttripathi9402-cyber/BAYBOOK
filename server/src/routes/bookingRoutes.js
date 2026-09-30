const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getVendorDashboardBookings
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/vendor/dashboard', protect, authorizeRoles('vendor', 'admin'), getVendorDashboardBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorizeRoles('vendor', 'admin'), updateBookingStatus);

module.exports = router;

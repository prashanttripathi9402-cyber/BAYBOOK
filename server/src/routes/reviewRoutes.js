const express = require('express');
const router = express.Router();
const { createReview, getVendorReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createReview);
router.get('/vendor/:vendorId', getVendorReviews);

module.exports = router;

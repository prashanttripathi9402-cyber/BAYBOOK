const express = require('express');
const router = express.Router();
const { getSlotsByVendorAndDate, configureSlots } = require('../controllers/slotController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', getSlotsByVendorAndDate);
router.post('/configure', protect, authorizeRoles('vendor', 'admin'), configureSlots);

module.exports = router;

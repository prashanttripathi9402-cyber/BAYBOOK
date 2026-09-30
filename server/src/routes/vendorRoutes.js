const express = require('express');
const router = express.Router();
const {
  getNearbyVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorApproval
} = require('../controllers/vendorController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/nearby', getNearbyVendors);
router.get('/:id', getVendorById);

// CRUD Routes for Garages
router.post('/', protect, authorizeRoles('vendor', 'admin'), createVendor);
router.put('/:id', protect, authorizeRoles('vendor', 'admin'), updateVendor);
router.delete('/:id', protect, authorizeRoles('vendor', 'admin'), deleteVendor);

router.patch('/:id/approve', protect, authorizeRoles('admin'), updateVendorApproval);

module.exports = router;

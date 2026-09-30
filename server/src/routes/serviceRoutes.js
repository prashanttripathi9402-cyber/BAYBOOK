const express = require('express');
const router = express.Router();
const {
  getServicesByVendor,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem
} = require('../controllers/serviceController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', getServicesByVendor);

// CRUD Routes for Service Catalog items
router.post('/', protect, authorizeRoles('vendor', 'admin'), createServiceItem);
router.put('/:id', protect, authorizeRoles('vendor', 'admin'), updateServiceItem);
router.delete('/:id', protect, authorizeRoles('vendor', 'admin'), deleteServiceItem);

module.exports = router;

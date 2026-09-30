const ServiceItem = require('../models/ServiceItem');
const Vendor = require('../models/Vendor');

// @desc    Get services by vendor ID
// @route   GET /api/services?vendorId=...&vehicleType=...
// @access  Public
const getServicesByVendor = async (req, res, next) => {
  try {
    const { vendorId, vehicleType } = req.query;
    const filter = {};
    if (vendorId) filter.vendorId = vendorId;
    if (vehicleType) filter.applicableTo = vehicleType;

    const services = await ServiceItem.find(filter);
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    CREATE a new Service Item (INSERT CRUD)
// @route   POST /api/services
// @access  Private (Vendor / Admin)
const createServiceItem = async (req, res, next) => {
  try {
    const { vendorId, category, title, description, price, durationMinutes, applicableTo } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor garage not found' });
    }

    if (vendor.ownerId.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this garage profile' });
    }

    const service = await ServiceItem.create({
      vendorId,
      category: category || 'General Service',
      title,
      description,
      price: Number(price),
      durationMinutes: Number(durationMinutes) || 60,
      applicableTo: applicableTo || ['Car', 'Bike', 'Scooter']
    });

    res.status(201).json({ success: true, message: 'Service item created successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    UPDATE an existing Service Item (UPDATE CRUD)
// @route   PUT /api/services/:id
// @access  Private (Vendor / Admin)
const updateServiceItem = async (req, res, next) => {
  try {
    const { category, title, description, price, durationMinutes, applicableTo } = req.body;

    let service = await ServiceItem.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service item not found' });
    }

    const vendor = await Vendor.findById(service.vendorId);
    if (vendor && vendor.ownerId.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service item' });
    }

    service = await ServiceItem.findByIdAndUpdate(
      req.params.id,
      {
        ...(category && { category }),
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
        ...(applicableTo && { applicableTo })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Service item updated successfully', data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    DELETE a Service Item (DELETE CRUD)
// @route   DELETE /api/services/:id
// @access  Private (Vendor / Admin)
const deleteServiceItem = async (req, res, next) => {
  try {
    const service = await ServiceItem.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service item not found' });
    }

    const vendor = await Vendor.findById(service.vendorId);
    if (vendor && vendor.ownerId.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service item' });
    }

    await ServiceItem.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Service item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServicesByVendor,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem
};

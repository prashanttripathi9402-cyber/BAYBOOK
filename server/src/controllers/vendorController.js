const Vendor = require('../models/Vendor');
const ServiceItem = require('../models/ServiceItem');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// @desc    Get nearby vendors using MongoDB 2dsphere geospatial search
// @route   GET /api/vendors/nearby
// @access  Public
const getNearbyVendors = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, vehicleType, minRating = 0, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and Longitude (lng) query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusInMeters,
          spherical: true
        }
      },
      {
        $match: {
          isApproved: true,
          averageRating: { $gte: parseFloat(minRating) }
        }
      }
    ];

    if (vehicleType && vehicleType !== 'All') {
      pipeline[1].$match.supportedVehicleTypes = vehicleType;
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { businessName: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const vendors = await Vendor.aggregate(pipeline);

    const formattedVendors = vendors.map(v => ({
      ...v,
      distanceKm: Math.round((v.distanceMeters / 1000) * 10) / 10
    }));

    res.status(200).json({
      success: true,
      count: formattedVendors.length,
      data: formattedVendors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor by ID with services
// @route   GET /api/vendors/:id
// @access  Public
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Service center not found' });
    }

    const services = await ServiceItem.find({ vendorId: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...vendor.toObject(),
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    CREATE / Register a new Garage profile (INSERT CRUD)
// @route   POST /api/vendors
// @access  Private (Vendor / Admin)
const createVendor = async (req, res, next) => {
  try {
    const {
      businessName,
      description,
      lng,
      lat,
      street,
      city,
      state,
      zipCode,
      supportedVehicleTypes,
      amenities,
      businessHours,
      images
    } = req.body;

    if (!businessName || !street || !city || lng === undefined || lat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required garage details (businessName, street, city, lat, lng)'
      });
    }

    const vendor = await Vendor.create({
      businessName,
      ownerId: req.user._id || req.user.id,
      description: description || 'Authorized vehicle servicing and maintenance garage center.',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      address: { street, city, state: state || 'Karnataka', zipCode: zipCode || '560001' },
      supportedVehicleTypes: supportedVehicleTypes && supportedVehicleTypes.length > 0 ? supportedVehicleTypes : ['Car', 'Bike', 'Scooter'],
      amenities: amenities && amenities.length > 0 ? amenities : ['AC Lounge', 'Free Wi-Fi', 'Water Wash'],
      businessHours: businessHours || { openTime: '09:00 AM', closeTime: '08:00 PM' },
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'],
      isApproved: true,
      averageRating: 4.8,
      totalReviews: 1
    });

    // Generate default services
    await ServiceItem.create({
      vendorId: vendor._id,
      category: 'General Service',
      title: 'Full Periodic Vehicle Servicing',
      description: 'Comprehensive inspection, synthetic oil change, brake check, and pressure foam wash.',
      price: vendor.supportedVehicleTypes.includes('Car') ? 2499 : 799,
      durationMinutes: 90,
      applicableTo: vendor.supportedVehicleTypes
    });

    // Generate default slots
    const slotTimes = [
      { startTime: '09:00 AM', endTime: '10:30 AM', capacity: 4 },
      { startTime: '10:30 AM', endTime: '12:00 PM', capacity: 4 },
      { startTime: '01:00 PM', endTime: '02:30 PM', capacity: 5 },
      { startTime: '02:30 PM', endTime: '04:00 PM', capacity: 5 }
    ];

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      for (const st of slotTimes) {
        await Slot.create({
          vendorId: vendor._id,
          date: dateStr,
          startTime: st.startTime,
          endTime: st.endTime,
          capacity: st.capacity,
          bookedCount: 0
        });
      }
    }

    res.status(201).json({ success: true, message: 'Garage created successfully', data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    UPDATE an existing Garage profile (UPDATE CRUD)
// @route   PUT /api/vendors/:id
// @access  Private (Vendor Owner / Admin)
const updateVendor = async (req, res, next) => {
  try {
    const {
      businessName,
      description,
      street,
      city,
      state,
      zipCode,
      lat,
      lng,
      supportedVehicleTypes,
      amenities,
      businessHours,
      images
    } = req.body;

    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor garage profile not found' });
    }

    // Check ownership
    if (vendor.ownerId.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this garage profile' });
    }

    const updateFields = {
      ...(businessName && { businessName }),
      ...(description && { description }),
      ...(supportedVehicleTypes && { supportedVehicleTypes }),
      ...(amenities && { amenities }),
      ...(businessHours && { businessHours }),
      ...(images && { images }),
      address: {
        street: street || vendor.address.street,
        city: city || vendor.address.city,
        state: state || vendor.address.state,
        zipCode: zipCode || vendor.address.zipCode
      }
    };

    if (lat !== undefined && lng !== undefined) {
      updateFields.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: 'Garage details updated successfully', data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    DELETE a Garage profile and all associated catalog & slots (DELETE CRUD)
// @route   DELETE /api/vendors/:id
// @access  Private (Vendor Owner / Admin)
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Garage profile not found' });
    }

    // Check ownership
    if (vendor.ownerId.toString() !== (req.user._id || req.user.id).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this garage' });
    }

    // Cascade delete associated service items, slots, and bookings
    await ServiceItem.deleteMany({ vendorId: req.params.id });
    await Slot.deleteMany({ vendorId: req.params.id });
    await Booking.deleteMany({ vendorId: req.params.id });
    await Vendor.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Garage and all associated records deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject vendor profile (Admin)
// @route   PATCH /api/vendors/:id/approve
// @access  Private (Admin)
const updateVendorApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorApproval
};

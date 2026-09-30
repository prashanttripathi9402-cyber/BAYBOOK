const Slot = require('../models/Slot');
const Vendor = require('../models/Vendor');

// @desc    Get slots for a vendor on a specific date
// @route   GET /api/slots?vendorId=...&date=YYYY-MM-DD
// @access  Public
const getSlotsByVendorAndDate = async (req, res, next) => {
  try {
    const { vendorId, date } = req.query;

    if (!vendorId || !date) {
      return res.status(400).json({ success: false, message: 'vendorId and date are required' });
    }

    let slots = await Slot.find({ vendorId, date }).sort({ startTime: 1 });

    // Auto-generate default hourly slots if none exist for this date
    if (slots.length === 0) {
      const defaultSlots = [
        { startTime: '09:00 AM', endTime: '10:30 AM', capacity: 3 },
        { startTime: '10:30 AM', endTime: '12:00 PM', capacity: 3 },
        { startTime: '01:00 PM', endTime: '02:30 PM', capacity: 4 },
        { startTime: '02:30 PM', endTime: '04:00 PM', capacity: 4 },
        { startTime: '04:00 PM', endTime: '05:30 PM', capacity: 3 },
        { startTime: '05:30 PM', endTime: '07:00 PM', capacity: 2 }
      ];

      const slotDocs = defaultSlots.map(s => ({
        vendorId,
        date,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        bookedCount: 0
      }));

      slots = await Slot.insertMany(slotDocs);
    }

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

// @desc    Vendor configures / updates slot capacity
// @route   POST /api/slots/configure
// @access  Private (Vendor)
const configureSlots = async (req, res, next) => {
  try {
    const { vendorId, date, slots } = req.body; // slots array: [{ startTime, endTime, capacity }]

    const vendor = await Vendor.findById(vendorId);
    if (!vendor || vendor.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this vendor profile' });
    }

    const createdSlots = [];
    for (const slotItem of slots) {
      const slot = await Slot.findOneAndUpdate(
        { vendorId, date, startTime: slotItem.startTime },
        { endTime: slotItem.endTime, capacity: slotItem.capacity },
        { upsert: true, new: true, runValidators: true }
      );
      createdSlots.push(slot);
    }

    res.status(200).json({ success: true, data: createdSlots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlotsByVendorAndDate,
  configureSlots
};

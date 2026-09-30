require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const ServiceItem = require('../models/ServiceItem');
const Slot = require('../models/Slot');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autofix_db');
    console.log('Clearing existing database collections...');

    await User.deleteMany({});
    await Vendor.deleteMany({});
    await ServiceItem.deleteMany({});
    await Slot.deleteMany({});

    console.log('Creating sample users...');
    const vendorUser = await User.create({
      name: 'Piston Manager',
      email: 'dealer@baybook.com',
      phone: '+91 9876543210',
      passwordHash: 'password123',
      role: 'vendor'
    });

    const customerUser = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      phone: '+91 9123456789',
      passwordHash: 'password123',
      role: 'customer',
      savedVehicles: [
        { vehicleType: 'Bike', make: 'Royal Enfield', model: 'Classic 350', regNumber: 'KA-05-RE-8899', fuelType: 'Petrol' },
        { vehicleType: 'Car', make: 'Hyundai', model: 'Creta', regNumber: 'KA-01-MJ-2024', fuelType: 'Petrol' }
      ]
    });

    console.log('Creating exact Garages matching baybook-ride-connect.lovable.app...');

    const baybookGaragesData = [
      {
        slug: 'piston-pedal',
        businessName: 'Piston & Pedal',
        description: 'Two-wheeler specialists — Royal Enfield, KTM, Honda, TVS.',
        lng: 77.6412, lat: 12.9784, // CMH Road, Indiranagar
        street: 'CMH Road', city: 'Indiranagar, Bengaluru', state: 'Karnataka', zipCode: '560038',
        supportedVehicleTypes: ['Bike', 'Scooter'],
        averageRating: 4.5, totalReviews: 540,
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Doorstep Pickup', 'Express 45-min Service', 'Nitrogen Air', 'Helmet Sanitization'],
        businessHours: { openTime: '08:00 AM', closeTime: '08:00 PM' },
        startingPrice: 149
      },
      {
        slug: 'scootfix-express',
        businessName: 'Scootfix Express',
        description: 'Quick 45-minute scooter service. Activa, Jupiter, Ather, Ola.',
        lng: 77.5820, lat: 12.9250, // Jayanagar 9th Block
        street: 'Jayanagar 9th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560041',
        supportedVehicleTypes: ['Scooter', 'Bike'],
        averageRating: 4.3, totalReviews: 1204,
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Doorstep Pickup', '30-min Express Bay', 'EV Charging', 'Water Wash'],
        businessHours: { openTime: '08:00 AM', closeTime: '09:00 PM' },
        startingPrice: 399
      },
      {
        slug: 'torque-garage',
        businessName: 'Torque Garage',
        description: 'Multi-brand car workshop with dealer-grade diagnostics and genuine spares.',
        lng: 77.6280, lat: 12.9280, // 80 Feet Rd, Koramangala 4th Block
        street: '80 Feet Rd, 4th Block', city: 'Koramangala, Bengaluru', state: 'Karnataka', zipCode: '560034',
        supportedVehicleTypes: ['Car'],
        averageRating: 4.7, totalReviews: 812,
        images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Doorstep Pickup', 'AC Waiting Lounge', 'OEM Spares', 'Live Stream'],
        businessHours: { openTime: '09:00 AM', closeTime: '07:00 PM' },
        startingPrice: 499
      },
      {
        slug: 'gloss-lab',
        businessName: 'Gloss Lab Detailing',
        description: 'Ceramic coating, PPF and premium interior detailing studio.',
        lng: 77.6510, lat: 12.9121, // HSR Layout Sector 2
        street: 'HSR Layout Sector 2', city: 'Bengaluru', state: 'Karnataka', zipCode: '560102',
        supportedVehicleTypes: ['Car', 'Bike'],
        averageRating: 4.8, totalReviews: 296,
        images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Cleanroom Coating Bay', '9H Ceramic Coating', 'PPF Film Studio', 'VIP Lounge'],
        businessHours: { openTime: '10:00 AM', closeTime: '07:00 PM' },
        startingPrice: 799
      },
      {
        slug: 'roadrescue',
        businessName: 'RoadRescue 24x7',
        description: 'Breakdown, towing and tyre replacement across the city.',
        lng: 77.6974, lat: 12.9592, // Outer Ring Rd, Marathahalli
        street: 'Outer Ring Rd', city: 'Marathahalli, Bengaluru', state: 'Karnataka', zipCode: '560037',
        supportedVehicleTypes: ['Car', 'Bike', 'Scooter'],
        averageRating: 4.1, totalReviews: 388,
        images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Doorstep Pickup', '24/7 Flatbed Tow Truck', 'Jumpstart', 'Tyre Puncture Care'],
        businessHours: { openTime: '06:00 AM', closeTime: '11:00 PM' },
        startingPrice: 399
      },
      {
        slug: 'whitefield-auto-hub',
        businessName: 'Whitefield Auto Hub',
        description: 'Full-service car centre with body shop and wheel alignment.',
        lng: 77.7499, lat: 12.9698, // ITPL Main Rd, Whitefield
        street: 'ITPL Main Rd', city: 'Whitefield, Bengaluru', state: 'Karnataka', zipCode: '560066',
        supportedVehicleTypes: ['Car', 'Scooter'],
        averageRating: 4.4, totalReviews: 657,
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'],
        amenities: ['Doorstep Pickup', 'Paint Body Shop', '3D Laser Alignment', 'Free Refreshments'],
        businessHours: { openTime: '09:00 AM', closeTime: '07:00 PM' },
        startingPrice: 499
      }
    ];

    const createdVendors = [];
    for (const v of baybookGaragesData) {
      const vendorDoc = await Vendor.create({
        businessName: v.businessName,
        ownerId: vendorUser._id,
        description: v.description,
        location: {
          type: 'Point',
          coordinates: [v.lng, v.lat]
        },
        address: {
          street: v.street,
          city: v.city,
          state: v.state,
          zipCode: v.zipCode
        },
        supportedVehicleTypes: v.supportedVehicleTypes,
        isApproved: true,
        averageRating: v.averageRating,
        totalReviews: v.totalReviews,
        images: v.images,
        amenities: v.amenities,
        businessHours: v.businessHours
      });
      createdVendors.push({ ...vendorDoc.toObject(), slug: v.slug, startingPrice: v.startingPrice });
    }

    console.log(`Created ${createdVendors.length} core Baybook garages! Creating service catalogs...`);

    for (const vendor of createdVendors) {
      const servicesData = [
        {
          category: 'General Service',
          title: `${vendor.businessName} Periodic Servicing`,
          description: `Comprehensive 40-point safety inspection, oil flush, brake servicing, and pressure wash for ${vendor.supportedVehicleTypes.join('/')}.`,
          price: vendor.startingPrice,
          durationMinutes: 60,
          applicableTo: vendor.supportedVehicleTypes
        },
        {
          category: 'Oil Change',
          title: 'Synthetic Engine Oil & Filter Change',
          description: 'High performance synthetic lubricant flush with original filter replacement.',
          price: vendor.startingPrice + 250,
          durationMinutes: 45,
          applicableTo: vendor.supportedVehicleTypes
        },
        {
          category: 'Detailing',
          title: 'Interior Steam Clean & Exterior Foam Wash',
          description: 'Deep extraction cleaning of upholstery, anti-bacterial fogging, and protective wax polish.',
          price: vendor.startingPrice + 500,
          durationMinutes: 90,
          applicableTo: vendor.supportedVehicleTypes
        }
      ];

      for (const s of servicesData) {
        await ServiceItem.create({
          vendorId: vendor._id,
          category: s.category,
          title: s.title,
          description: s.description,
          price: s.price,
          durationMinutes: s.durationMinutes,
          applicableTo: s.applicableTo
        });
      }

      // Create BookMyShow hourly slots
      const slotTimes = [
        { startTime: '08:00 AM', endTime: '09:30 AM', capacity: 3 },
        { startTime: '09:30 AM', endTime: '11:00 AM', capacity: 4 },
        { startTime: '11:00 AM', endTime: '12:30 PM', capacity: 4 },
        { startTime: '01:30 PM', endTime: '03:00 PM', capacity: 5 },
        { startTime: '03:00 PM', endTime: '04:30 PM', capacity: 4 },
        { startTime: '04:30 PM', endTime: '06:00 PM', capacity: 3 }
      ];

      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const d = new Date();
        d.setDate(d.getDate() + dayOffset);
        const dateStr = d.toISOString().slice(0, 10);

        for (const st of slotTimes) {
          const bookedCount = Math.floor(Math.random() * st.capacity);
          await Slot.create({
            vendorId: vendor._id,
            date: dateStr,
            startTime: st.startTime,
            endTime: st.endTime,
            capacity: st.capacity,
            bookedCount
          });
        }
      }
    }

    console.log('✅ Exact Baybook garages, service catalogs & slots seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

async function runTest() {
  try {
    console.log('1. Logging in as test customer...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rohan@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('Token acquired:', token.slice(0, 25) + '...');

    console.log('2. Fetching nearby vendor...');
    const vendorRes = await fetch('http://localhost:5000/api/vendors/nearby?lat=12.9345&lng=77.6387');
    const vendorData = await vendorRes.json();
    const vendor = vendorData.data[0];
    console.log('Vendor:', vendor.businessName, 'ID:', vendor._id);

    const todayStr = new Date().toISOString().slice(0, 10);
    console.log('3. Fetching slots for date:', todayStr);
    const slotsRes = await fetch(`http://localhost:5000/api/slots?vendorId=${vendor._id}&date=${todayStr}`);
    const slotsData = await slotsRes.json();
    const slot = slotsData.data[0];
    console.log('Slot:', slot._id, slot.startTime, slot.endTime, 'Capacity:', slot.capacity, 'Booked:', slot.bookedCount);

    console.log('4. Fetching services for vendor...');
    const servicesRes = await fetch(`http://localhost:5000/api/services?vendorId=${vendor._id}`);
    const servicesData = await servicesRes.json();
    const service = servicesData.data[0];
    console.log('Service:', service.title, 'ID:', service._id);

    console.log('5. Creating booking...');
    const bookingRes = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vendorId: vendor._id,
        vehicleDetails: {
          vehicleType: 'Car',
          make: 'Hyundai',
          model: 'Creta',
          regNumber: 'KA-01-MJ-2024',
          fuelType: 'Petrol'
        },
        serviceIds: [service._id],
        slotId: slot._id,
        deliveryMode: 'Self Visit'
      })
    });

    const bookingData = await bookingRes.json();
    console.log('Booking Result:', bookingData);
  } catch (err) {
    console.error('❌ BOOKING ERROR:', err.message);
  }
}

runTest();

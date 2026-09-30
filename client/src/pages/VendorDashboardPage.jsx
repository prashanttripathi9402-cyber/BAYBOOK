import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Clock, Wrench, CheckCircle2, Sliders, Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import API from '../services/api';

export default function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState('garage'); // 'garage' | 'services' | 'bookings'
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Garage Modal State (UPDATE CRUD)
  const [editingGarage, setEditingGarage] = useState(false);
  const [garageName, setGarageName] = useState('');
  const [garageDesc, setGarageDesc] = useState('');
  const [garageStreet, setGarageStreet] = useState('');
  const [garageCity, setGarageCity] = useState('');
  const [savingGarage, setSavingGarage] = useState(false);

  // Service CRUD Modal State (INSERT & UPDATE CRUD)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState(999);
  const [serviceCategory, setServiceCategory] = useState('General Service');
  const [serviceDuration, setServiceDuration] = useState(60);
  const [savingService, setSavingService] = useState(false);

  // Fetch Vendor Data, Services, and Bookings
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Vendor Profile for logged in owner
      const resBookings = await API.get('/bookings/vendor/dashboard');
      setBookings(resBookings.data.data || []);

      // Try fetching first nearby vendor or vendor profile
      const resVendors = await API.get('/vendors/nearby?lat=12.9345&lng=77.6387&radius=50');
      if (resVendors.data.data && resVendors.data.data.length > 0) {
        const currentVendor = resVendors.data.data[0];
        setVendor(currentVendor);
        setGarageName(currentVendor.businessName);
        setGarageDesc(currentVendor.description);
        setGarageStreet(currentVendor.address?.street || '');
        setGarageCity(currentVendor.address?.city || '');

        // 2. Fetch Service Catalog for this vendor
        const resServices = await API.get(`/services?vendorId=${currentVendor._id}`);
        setServices(resServices.data.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // -------------------------------------------------------------
  // GARAGE UPDATE CRUD (PUT /api/vendors/:id)
  // -------------------------------------------------------------
  const handleUpdateGarage = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setSavingGarage(true);
    try {
      const payload = {
        businessName: garageName,
        description: garageDesc,
        street: garageStreet,
        city: garageCity
      };
      const res = await API.put(`/vendors/${vendor._id}`, payload);
      if (res.data.success) {
        alert('✅ Garage details updated successfully via PUT /api/vendors/:id!');
        setVendor(res.data.data);
        setEditingGarage(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update garage details');
    } finally {
      setSavingGarage(false);
    }
  };

  // -------------------------------------------------------------
  // GARAGE DELETE CRUD (DELETE /api/vendors/:id)
  // -------------------------------------------------------------
  const handleDeleteGarage = async () => {
    if (!vendor) return;
    if (!window.confirm(`Are you sure you want to delete garage "${vendor.businessName}"? This action cannot be undone.`)) return;

    try {
      await API.delete(`/vendors/${vendor._id}`);
      alert('🗑️ Garage and all associated catalog items deleted via DELETE /api/vendors/:id!');
      setVendor(null);
      setServices([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete garage');
    }
  };

  // -------------------------------------------------------------
  // SERVICE INSERT & UPDATE CRUD (POST & PUT /api/services)
  // -------------------------------------------------------------
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!vendor) return;
    setSavingService(true);
    try {
      const payload = {
        vendorId: vendor._id,
        category: serviceCategory,
        title: serviceTitle,
        description: serviceDesc,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        applicableTo: vendor.supportedVehicleTypes || ['Car', 'Bike', 'Scooter']
      };

      if (editingServiceId) {
        // UPDATE Service via PUT /api/services/:id
        await API.put(`/services/${editingServiceId}`, payload);
        alert('✅ Service item updated successfully via PUT /api/services/:id!');
      } else {
        // INSERT Service via POST /api/services
        await API.post('/services', payload);
        alert('➕ New Service item created successfully via POST /api/services!');
      }

      setServiceModalOpen(false);
      resetServiceForm();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service item');
    } finally {
      setSavingService(false);
    }
  };

  // -------------------------------------------------------------
  // SERVICE DELETE CRUD (DELETE /api/services/:id)
  // -------------------------------------------------------------
  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Delete service "${serviceTitle}" from catalog?`)) return;

    try {
      await API.delete(`/services/${serviceId}`);
      alert(`🗑️ Service "${serviceTitle}" deleted via DELETE /api/services/:id!`);
      setServices(prev => prev.filter(s => s._id !== serviceId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service item');
    }
  };

  const openAddServiceModal = () => {
    resetServiceForm();
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (item) => {
    setEditingServiceId(item._id);
    setServiceTitle(item.title);
    setServiceDesc(item.description);
    setServicePrice(item.price);
    setServiceCategory(item.category);
    setServiceDuration(item.durationMinutes);
    setServiceModalOpen(true);
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceTitle('');
    setServiceDesc('');
    setServicePrice(999);
    setServiceCategory('General Service');
    setServiceDuration(60);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Vendor Portal Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Dealer Portal — REST API CRUD Management
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            {vendor?.businessName || 'Garage Partner Control Panel'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute live Insert, Update, and Delete operations mapped directly to REST API endpoints
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('garage')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'garage' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Garage Profile (CRUD)
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Catalog ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bookings Queue ({bookings.length})
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: GARAGE PROFILE CRUD (PUT & DELETE REST ENDPOINTS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'garage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Garage Details Management</h2>
              <p className="text-xs text-slate-400">REST Endpoints: PUT /api/vendors/:id • DELETE /api/vendors/:id</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditingGarage(!editingGarage)}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{editingGarage ? 'Cancel Editing' : 'Edit Garage (PUT)'}</span>
              </button>

              <button
                onClick={handleDeleteGarage}
                className="bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/80 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Garage (DELETE)</span>
              </button>
            </div>
          </div>

          {!vendor ? (
            <div className="py-12 text-center text-slate-400">No garage profile registered. Use + Add Garage button to insert a new garage.</div>
          ) : editingGarage ? (
            /* Update Garage Form */
            <form onSubmit={handleUpdateGarage} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={garageName}
                  onChange={e => setGarageName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={garageDesc}
                  onChange={e => setGarageDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Street</label>
                  <input
                    type="text"
                    value={garageStreet}
                    onChange={e => setGarageStreet(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={garageCity}
                    onChange={e => setGarageCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingGarage}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-lg"
              >
                {savingGarage ? 'Saving Updates...' : 'Execute PUT Update'}
              </button>
            </form>
          ) : (
            /* Read Garage View */
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="text-slate-400">Business Name</div>
                <div className="text-base font-bold text-white">{vendor.businessName}</div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="text-slate-400">Description</div>
                <div className="text-slate-200">{vendor.description}</div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="text-slate-400">Address Location</div>
                <div className="text-slate-200">{vendor.address?.street}, {vendor.address?.city}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SERVICE CATALOG CRUD (POST, PUT, DELETE REST ENDPOINTS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Service Item Catalog CRUD</h2>
              <p className="text-xs text-slate-400">REST Endpoints: POST /api/services • PUT /api/services/:id • DELETE /api/services/:id</p>
            </div>

            <button
              onClick={openAddServiceModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Insert New Service Item (POST)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(item => (
              <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-start gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-2">{item.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      ₹{item.price}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      ⏱ {item.durationMinutes} mins
                    </span>
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditServiceModal(item)}
                    className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40"
                    title="Edit Service Item (PUT)"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(item._id, item.title)}
                    className="p-2 bg-red-950/60 text-red-400 border border-red-800/60 rounded-lg hover:bg-red-900/80"
                    title="Delete Service Item (DELETE)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: BOOKINGS QUEUE MANAGEMENT (PATCH /api/bookings/:id/status) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Incoming Service Bookings Queue</h2>
          <div className="grid grid-cols-1 gap-4">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-xs font-mono font-bold text-blue-400">{booking.bookingNumber}</div>
                  <div className="text-sm font-bold text-white mt-1">Customer: {booking.customerId?.name || 'Customer'}</div>
                  <div className="text-xs text-slate-400">{booking.bookingDate} • {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Update Status:</span>
                  <select
                    value={booking.status}
                    onChange={async (e) => {
                      await API.patch(`/bookings/${booking._id}/status`, { status: e.target.value });
                      fetchDashboardData();
                    }}
                    className="bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700 rounded-xl px-3 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Vehicle Received">Vehicle Received</option>
                    <option value="In Service">In Service</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SERVICE INSERT / UPDATE MODAL */}
      {/* ------------------------------------------------------------- */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">
              {editingServiceId ? 'Edit Service Item (PUT)' : 'Insert New Service Item (POST)'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthetic Engine Oil Replacement"
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={serviceCategory}
                  onChange={e => setServiceCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="General Service">General Service</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tyre Care">Tyre Care</option>
                  <option value="Detailing">Detailing</option>
                  <option value="Breakdown/Towing">Breakdown/Towing</option>
                  <option value="Brake Repair">Brake Repair</option>
                  <option value="AC Service">AC Service</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceDesc}
                  onChange={e => setServiceDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={servicePrice}
                    onChange={e => setServicePrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={serviceDuration}
                    onChange={e => setServiceDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold"
                >
                  {savingService ? 'Saving...' : editingServiceId ? 'Execute PUT' : 'Execute POST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

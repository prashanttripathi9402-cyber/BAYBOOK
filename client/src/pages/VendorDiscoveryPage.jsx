import React, { useState, useEffect } from 'react';
import { Search, MapPin, Car, Bike, Filter, Star, Loader2, Navigation, Compass, AlertCircle, LayoutGrid, Map as MapIcon } from 'lucide-react';
import API from '../services/api';
import VendorCard from '../components/VendorCard';
import DiscoveryMap from '../components/DiscoveryMap';
import SlotBookingCalendar from '../components/SlotBookingCalendar';

export default function VendorDiscoveryPage({ currentLocation, onOpenLocationModal }) {
  const [radius, setRadius] = useState(15); // Radius in KM
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeVendorForBooking, setActiveVendorForBooking] = useState(null);

  // Fetch Nearby Vendors using 2dsphere $geoNear endpoint
  const fetchNearbyVendors = async () => {
    setLoading(true);
    try {
      let query = `/vendors/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=${radius}&minRating=${minRating}`;
      if (selectedVehicleType !== 'All') {
        query += `&vehicleType=${selectedVehicleType}`;
      }
      if (searchTerm) {
        query += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const res = await API.get(query);
      setVendors(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch nearby vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyVendors();
  }, [currentLocation, radius, selectedVehicleType, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header & Geospatial Search Bar */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> High-Accuracy 2dsphere Geospatial Discovery
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Book Verified Vehicle Servicing <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Near You</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Discover top-rated garages for Cars, Bikes & Scooters. Compare pricing, check live hourly slot availability, and reserve in under 60 seconds.
          </p>

          {/* Search Bar Row */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search garage name, oil change, detailing, brake repair..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchNearbyVendors()}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <button
              onClick={onOpenLocationModal}
              className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <Navigation className="w-4 h-4 text-blue-400" />
              <span className="max-w-[150px] truncate">{currentLocation.name}</span>
            </button>

            <button
              onClick={fetchNearbyVendors}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Vehicle Segment Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Segment:</span>
          {['All', 'Car', 'Bike', 'Scooter'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedVehicleType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedVehicleType === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Distance Radius Slider */}
        <div className="flex items-center gap-3 bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
          <span className="text-xs font-semibold text-slate-300">GPS Radius:</span>
          <input
            type="range"
            min="2"
            max="50"
            value={radius}
            onChange={e => setRadius(e.target.value)}
            className="w-24 accent-blue-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-blue-400 font-mono w-10">{radius} km</span>
        </div>

        {/* Min Rating */}
        <div className="flex items-center gap-2">
          <select
            value={minRating}
            onChange={e => setMinRating(Number(e.target.value))}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value={0}>All Ratings</option>
            <option value={4.0}>4.0★ & Above</option>
            <option value={4.5}>4.5★ & Above</option>
          </select>
        </div>

        {/* View Toggle: Grid vs Interactive Map */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Main Vendor Feed */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Nearby Service Centers</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
              {vendors.length} Verified Garages
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm">Calculating 2dsphere geospatial distances...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No service centers found in this radius</h3>
            <p className="text-xs text-slate-500">Try expanding your GPS search radius or selecting a different city.</p>
          </div>
        ) : viewMode === 'map' ? (
          <DiscoveryMap
            vendors={vendors}
            center={currentLocation}
            onSelectVendor={v => setActiveVendorForBooking(v)}
          />
        ) : (
          <div className="space-y-6">
            {vendors.map(vendor => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                onSelectVendor={v => setActiveVendorForBooking(v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* BookMyShow Slot Booking Modal */}
      {activeVendorForBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8">
            <button
              onClick={() => setActiveVendorForBooking(null)}
              className="absolute -top-4 -right-4 bg-slate-800 hover:bg-slate-700 text-white w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center z-50 font-bold shadow-lg"
            >
              ✕
            </button>
            <SlotBookingCalendar
              vendor={activeVendorForBooking}
              onBookingSuccess={(booking) => {
                setActiveVendorForBooking(null);
                alert(`🎉 Booking Confirmed Successfully!\nBooking Reference #: ${booking.bookingNumber}\nCheck My Bookings tab for live tracking.`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

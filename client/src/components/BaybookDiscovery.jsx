import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Calendar,
  Store,
  Check,
  Clock,
  Truck,
  Car,
  Bike,
  SlidersHorizontal,
  ChevronRight,
  Search,
  Loader2,
  MapPin
} from 'lucide-react';
import API from '../services/api';
import SlotBookingCalendar from './SlotBookingCalendar';

// Fallback dataset matching baybook-ride-connect.lovable.app
const INITIAL_BAYBOOK_GARAGES = [
  {
    _id: 'piston-pedal',
    businessName: 'Piston & Pedal',
    isVerified: true,
    averageRating: 4.5,
    totalReviews: 540,
    address: { street: 'CMH Road', city: 'Indiranagar' },
    distanceKm: 5.1,
    description: 'Two-wheeler specialists — Royal Enfield, KTM, Honda, TVS.',
    supportedVehicleTypes: ['Bike', 'Scooter'],
    businessHours: { openTime: '08:00 AM', closeTime: '08:00 PM' },
    amenities: ['Doorstep pickup'],
    startingPrice: 149,
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'scootfix-express',
    businessName: 'Scootfix Express',
    isVerified: true,
    averageRating: 4.3,
    totalReviews: 1204,
    address: { street: 'Jayanagar 9th Block', city: 'Bengaluru' },
    distanceKm: 5.2,
    description: 'Quick 45-minute scooter service. Activa, Jupiter, Ather, Ola.',
    supportedVehicleTypes: ['Scooter', 'Bike'],
    businessHours: { openTime: '08:00 AM', closeTime: '09:00 PM' },
    amenities: ['Doorstep pickup'],
    startingPrice: 399,
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'torque-garage',
    businessName: 'Torque Garage',
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 812,
    address: { street: '80 Feet Rd', city: 'Koramangala 4th Block' },
    distanceKm: 5.2,
    description: 'Multi-brand car workshop with dealer-grade diagnostics and genuine spares.',
    supportedVehicleTypes: ['Car'],
    businessHours: { openTime: '09:00 AM', closeTime: '07:00 PM' },
    amenities: ['Doorstep pickup'],
    startingPrice: 499,
    images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'gloss-lab',
    businessName: 'Gloss Lab Detailing',
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 296,
    address: { street: 'HSR Layout Sector 2', city: 'Bengaluru' },
    distanceKm: 8.2,
    description: 'Ceramic coating, PPF and premium interior detailing studio.',
    supportedVehicleTypes: ['Car', 'Bike'],
    businessHours: { openTime: '10:00 AM', closeTime: '07:00 PM' },
    amenities: [],
    startingPrice: 799,
    images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'roadrescue',
    businessName: 'RoadRescue 24x7',
    isVerified: true,
    averageRating: 4.1,
    totalReviews: 388,
    address: { street: 'Outer Ring Rd', city: 'Marathahalli' },
    distanceKm: 11.7,
    description: 'Breakdown, towing and tyre replacement across the city.',
    supportedVehicleTypes: ['Car', 'Bike', 'Scooter'],
    businessHours: { openTime: '06:00 AM', closeTime: '11:00 PM' },
    amenities: ['Doorstep pickup'],
    startingPrice: 399,
    images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'whitefield-auto-hub',
    businessName: 'Whitefield Auto Hub',
    isVerified: true,
    averageRating: 4.4,
    totalReviews: 657,
    address: { street: 'ITPL Main Rd', city: 'Whitefield' },
    distanceKm: 16.8,
    description: 'Full-service car centre with body shop and wheel alignment.',
    supportedVehicleTypes: ['Car', 'Scooter'],
    businessHours: { openTime: '09:00 AM', closeTime: '07:00 PM' },
    amenities: ['Doorstep pickup'],
    startingPrice: 499,
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80']
  }
];

export default function BaybookDiscovery({ onOpenAuthModal, onOpenAddGarageModal }) {
  // Filter States
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedService, setSelectedService] = useState('Any');
  const [minRating, setMinRating] = useState('Any');
  const [maxDistance, setMaxDistance] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  // Active highlighted card ID
  const [selectedGarageId, setSelectedGarageId] = useState('piston-pedal');

  // Live database garages state
  const [garages, setGarages] = useState(INITIAL_BAYBOOK_GARAGES);
  const [loading, setLoading] = useState(false);

  // Active garage for slot booking drawer
  const [bookingVendor, setBookingVendor] = useState(null);

  // Fetch live 2dsphere garages from MongoDB API
  useEffect(() => {
    const fetchLiveGarages = async () => {
      setLoading(true);
      try {
        let query = `/vendors/nearby?lat=12.9345&lng=77.6387&radius=${maxDistance}`;
        if (minRating !== 'Any') {
          query += `&minRating=${minRating.replace('+', '')}`;
        }
        if (selectedVehicle !== 'All') {
          query += `&vehicleType=${selectedVehicle}`;
        }
        if (searchQuery) {
          query += `&search=${encodeURIComponent(searchQuery)}`;
        }
        const res = await API.get(query);
        if (res.data.data && res.data.data.length > 0) {
          setGarages(res.data.data);
          if (!selectedGarageId) setSelectedGarageId(res.data.data[0]._id);
        } else {
          setGarages([]);
        }
      } catch (err) {
        console.warn('Using fallback Baybook dataset:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveGarages();
  }, [maxDistance, minRating, selectedVehicle, searchQuery]);

  // Client-side Filter Safeguard
  const filteredGarages = useMemo(() => {
    return garages.filter(g => {
      const vehicleTypes = g.supportedVehicleTypes || [];
      if (selectedVehicle !== 'All' && !vehicleTypes.includes(selectedVehicle)) {
        return false;
      }
      if (minRating !== 'Any') {
        const threshold = parseFloat(minRating);
        if ((g.averageRating || 4.5) < threshold) return false;
      }
      if (g.distanceKm !== undefined && g.distanceKm > maxDistance) {
        return false;
      }
      return true;
    });
  }, [garages, selectedVehicle, minRating, maxDistance]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans antialiased selection:bg-amber-400 selection:text-black">
      
      {/* ------------------------------------------------------------- */}
      {/* STICKY TOP NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
            <Wrench className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-wider uppercase">
              Baybook
            </span>
            <span className="text-[11px] text-zinc-400 block -mt-1 font-medium">
              Service bays open near you
            </span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
          <a
            href="/tracker"
            className="text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>My bookings</span>
          </a>

          <button
            onClick={onOpenAddGarageModal}
            className="text-zinc-300 hover:text-white flex items-center gap-2 transition-colors hidden sm:flex"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Garage partner</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="bg-amber-400 text-black font-extrabold px-4 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* MAIN HERO BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find a garage. <span className="text-amber-400">Lock your slot.</span>
        </h1>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TWO-COLUMN DASHBOARD LAYOUT */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-8">
        
        {/* LEFT SIDEBAR: FILTER PANEL (Width ~ 280px) */}
        <aside className="w-full md:w-72 shrink-0 space-y-6">
          <div className="bg-[#13151b] border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xl">
            
            {/* 1. VEHICLE PILL SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                Vehicle
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Car', 'Bike', 'Scooter'].map(type => {
                  const isActive = selectedVehicle === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedVehicle(type)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                          : 'bg-[#181a20] text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SERVICE PILL SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                Service
              </label>
              <div className="flex flex-wrap gap-2">
                {['Any', 'General Service', 'Oil Change', 'Tyre Care', 'Detailing', 'Breakdown/Towing'].map(service => {
                  const isActive = selectedService === service;
                  return (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                          : 'bg-[#181a20] text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. MINIMUM RATING PILL SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                Minimum rating
              </label>
              <div className="flex flex-wrap gap-2">
                {['Any', '4+', '4.3+', '4.5+'].map(rating => {
                  const isActive = minRating === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                          : 'bg-[#181a20] text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {rating === 'Any' ? 'Any' : `${rating}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. DISTANCE SLIDER */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Within {maxDistance} km
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN AREA: VENDOR LISTING FEED */}
        <main className="flex-1 space-y-4">
          
          {/* Header Row */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              {filteredGarages.length} garages · nearest first
            </h2>

            {/* Search Input Bar */}
            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search garages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#13151b] border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Garages List */}
          {loading ? (
            <div className="py-16 text-center text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>Fetching live Baybook garages...</span>
            </div>
          ) : filteredGarages.length === 0 ? (
            <div className="bg-[#13151b] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 space-y-2">
              <p className="text-base font-bold text-zinc-300">No garages found matching criteria</p>
              <p className="text-xs text-zinc-500">Try expanding your distance slider or resetting vehicle filters.</p>
            </div>
          ) : (
            filteredGarages.map(garage => {
              const isSelected = selectedGarageId === (garage._id || garage.id);
              const vehicleTypes = garage.supportedVehicleTypes || ['Bike', 'Scooter'];
              const street = garage.address?.street || garage.street || 'CMH Road';
              const city = garage.address?.city || garage.city || 'Indiranagar';

              return (
                <div
                  key={garage._id || garage.id}
                  onClick={() => setSelectedGarageId(garage._id || garage.id)}
                  className={`bg-[#13151b] rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden border ${
                    isSelected
                      ? 'border-amber-400 shadow-xl shadow-amber-400/5 ring-1 ring-amber-400'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex justify-between items-start gap-4">
                    
                    {/* Left: Title & Verified Icon */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black tracking-tight text-white">
                        {garage.businessName || garage.name}
                      </h3>
                      <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Right: Green Rating Badge */}
                    <div className="bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                      <span>★ {garage.averageRating || garage.rating || 4.5}</span>
                      <span className="text-emerald-500/80 font-normal">({garage.totalReviews || garage.reviewsCount || 540})</span>
                    </div>
                  </div>

                  {/* Address & Proximity Row */}
                  <div className="mt-1 text-xs text-zinc-400 font-medium">
                    {street}, {city} <span className="text-zinc-600">·</span> <span className="text-zinc-300">{garage.distanceKm || 5.1} km</span>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {garage.description}
                  </p>

                  {/* Footer Row */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    {/* Left Tags */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-400">
                      {/* Vehicle Types */}
                      <div className="flex items-center gap-1.5 bg-[#181a20] border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-300">
                        {vehicleTypes.includes('Car') ? <Car className="w-3 h-3 text-zinc-400" /> : <Bike className="w-3 h-3 text-zinc-400" />}
                        <span>{vehicleTypes.join(', ')}</span>
                      </div>

                      {/* Operating Hours */}
                      <div className="flex items-center gap-1 bg-[#181a20] border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{garage.businessHours?.openTime ? `${garage.businessHours.openTime.replace(' AM','')}-${garage.businessHours.closeTime.replace(' PM','')}` : '8:00–20:00'}</span>
                      </div>

                      {/* Doorstep Pickup Tag */}
                      <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 px-2.5 py-1 rounded-md font-medium">
                        <Truck className="w-3 h-3 text-amber-400" />
                        <span>Doorstep pickup</span>
                      </div>
                    </div>

                    {/* Right Price & Book Action */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">from</div>
                        <div className="text-xl font-extrabold text-white flex items-center justify-end font-mono">
                          ₹{garage.startingPrice || 149}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingVendor(garage);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition-all shadow-md shadow-amber-400/20 shrink-0"
                      >
                        <span>Book Slot</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* BookMyShow Slot Booking Drawer / Modal */}
      {bookingVendor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8">
            <button
              onClick={() => setBookingVendor(null)}
              className="absolute -top-4 -right-4 bg-zinc-800 hover:bg-zinc-700 text-white w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center z-50 font-bold shadow-lg"
            >
              ✕
            </button>
            <SlotBookingCalendar
              vendor={bookingVendor}
              onBookingSuccess={(booking) => {
                setBookingVendor(null);
                alert(`🎉 Service Slot Reserved on Baybook!\nBooking Reference: ${booking.bookingNumber}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

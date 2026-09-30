import React, { useState } from 'react';
import { Building2, MapPin, Car, Bike, Check, Loader2, Image, ShieldCheck, Clock } from 'lucide-react';
import API from '../services/api';

export default function AddGarageModal({ isOpen, onClose, onGarageAdded }) {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [zipCode, setZipCode] = useState('560034');
  const [lat, setLat] = useState(12.9345);
  const [lng, setLng] = useState(77.6387);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80');

  const [supportedVehicleTypes, setSupportedVehicleTypes] = useState(['Car', 'Bike', 'Scooter']);
  const [selectedAmenities, setSelectedAmenities] = useState(['AC Lounge', 'Free Wi-Fi', 'Water Wash']);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleVehicleType = (type) => {
    setSupportedVehicleTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleGPSAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        alert(`Detected GPS Coordinates: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!businessName || !street || !city) {
      setErrorMsg('Please fill in required fields (Garage Name, Street, City)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        businessName,
        description,
        street,
        city,
        state,
        zipCode,
        lat: Number(lat),
        lng: Number(lng),
        supportedVehicleTypes,
        amenities: selectedAmenities,
        images: [imageUrl]
      };

      const res = await API.post('/vendors', payload);

      if (res.data.success) {
        alert('🎉 Garage Partner Registered Successfully! Your garage is now live on the 2dsphere discovery map.');
        if (onGarageAdded) onGarageAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register garage partner profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold"
        >
          ✕
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Dealer & Partner Portal
          </div>
          <h2 className="text-2xl font-black text-white mt-2">Register & Add New Garage Partner</h2>
          <p className="text-xs text-slate-400 mt-1">List your service garage center on the 2dsphere geospatial discovery network</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Garage Name */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Garage / Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Speed Motors & Detailing Studio"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Business Description</label>
            <textarea
              rows={2}
              placeholder="Describe your garage services, mechanic experience, and specializations..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="80 Feet Road, 4th Block, Koramangala"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* GPS Pin Coordinates */}
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Pin Coordinates (Lat / Lng)
              </span>
              <button
                type="button"
                onClick={handleGPSAutoDetect}
                className="text-blue-400 font-bold hover:underline text-[11px]"
              >
                Auto-Fill My Current Location
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                required
                placeholder="Latitude (e.g. 12.9345)"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Longitude (e.g. 77.6387)"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Supported Vehicle Segments */}
          <div>
            <label className="text-slate-300 font-semibold block mb-2">Supported Vehicle Segments</label>
            <div className="flex gap-3">
              {['Car', 'Bike', 'Scooter'].map(type => {
                const active = supportedVehicleTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleVehicleType(type)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                      active
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 ring-1 ring-blue-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {type} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storefront Image URL */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Storefront Photo Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 text-xs mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Register & Publish Garage Partner Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

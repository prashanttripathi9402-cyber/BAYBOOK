import React, { useState } from 'react';
import { Navigation, MapPin, Search, Check, Loader2, Compass, Building2 } from 'lucide-react';
import { METRO_CITIES, reverseGeocode, searchLocation } from '../services/geoService';

export default function LocationPickerModal({ currentLocation, onSelectLocation, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGPSLocating, setIsGPSLocating] = useState(false);

  // Trigger browser GPS request
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGPSLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        onSelectLocation({ name: `📍 ${name}`, lat, lng, isGPS: true });
        setIsGPSLocating(false);
        onClose();
      },
      (err) => {
        setIsGPSLocating(false);
        alert('Could not access GPS location. Please select a city or search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search locality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold"
        >
          ✕
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" /> High-Precision GPS & Location Selector
          </div>
          <h2 className="text-xl font-extrabold text-white mt-2">Choose Service Search Location</h2>
          <p className="text-xs text-slate-400 mt-1">Vendors will be discovered within your specified GPS radius</p>
        </div>

        {/* Live GPS Button */}
        <button
          disabled={isGPSLocating}
          onClick={handleGPSDetect}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 text-xs"
        >
          {isGPSLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Detecting GPS & Reverse Geocoding...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 fill-white" />
              <span>Use My Current Live GPS Location</span>
            </>
          )}
        </button>

        {/* Custom Location Search */}
        <form onSubmit={handleSearch} className="space-y-2">
          <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-blue-400" /> Search Any Neighborhood / Street / City
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Koramangala 4th Block, Bandra West, CP Delhi"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
            </button>
          </div>
        </form>

        {/* Search Results list */}
        {searchResults.length > 0 && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
            {searchResults.map((res, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectLocation({ name: res.name.split(',')[0], lat: res.lat, lng: res.lng });
                  onClose();
                }}
                className="w-full text-left p-2 hover:bg-slate-700 rounded-lg text-xs text-slate-200 truncate flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{res.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Metro Cities Presets */}
        <div>
          <label className="text-xs text-slate-400 font-semibold mb-2 block flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Popular Metro Hubs
          </label>
          <div className="grid grid-cols-2 gap-2">
            {METRO_CITIES.map(city => {
              const isSelected = currentLocation?.name === city.name;
              return (
                <button
                  key={city.name}
                  onClick={() => {
                    onSelectLocation(city);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate">{city.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

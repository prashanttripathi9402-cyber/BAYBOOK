import React from 'react';
import { Star, MapPin, Car, Bike, CheckCircle, ChevronRight, Clock } from 'lucide-react';

export default function VendorCard({ vendor, onSelectVendor }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/70 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/30 flex flex-col md:flex-row group">
      {/* Garage Image */}
      <div className="md:w-64 h-48 md:h-auto relative overflow-hidden shrink-0">
        <img
          src={vendor.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'}
          alt={vendor.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-xs font-bold text-amber-400 flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{vendor.averageRating || 4.8}</span>
          <span className="text-slate-400 font-normal">({vendor.totalReviews || 80})</span>
        </div>

        {vendor.distanceKm !== undefined && (
          <div className="absolute bottom-3 left-3 bg-blue-600/90 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{vendor.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {vendor.businessName}
            </h3>
            <span className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Verified Garage
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
            {vendor.description || 'Full-service multi-brand garage offering general service, detailing, brake care, and quick diagnostic scan.'}
          </p>

          {/* Address & Hours */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{vendor.address?.street}, {vendor.address?.city}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{vendor.businessHours?.openTime || '09:00 AM'} - {vendor.businessHours?.closeTime || '08:00 PM'}</span>
            </div>
          </div>

          {/* Vehicle Types Badges & Amenities */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {vendor.supportedVehicleTypes?.map(type => (
              <span key={type} className="bg-slate-900 border border-slate-700 text-blue-300 text-[11px] font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1">
                {type === 'Car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                {type}
              </span>
            ))}
            {vendor.amenities?.slice(0, 3).map(amenity => (
              <span key={amenity} className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Slots available <span className="text-emerald-400 font-bold">Today & Tomorrow</span>
          </div>

          <button
            onClick={() => onSelectVendor(vendor)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
          >
            <span>Book Service Slot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

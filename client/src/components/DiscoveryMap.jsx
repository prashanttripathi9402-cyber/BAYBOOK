import React, { useEffect, useRef } from 'react';
import { Star, MapPin, ChevronRight, Car, Bike } from 'lucide-react';

export default function DiscoveryMap({ vendors, center, onSelectVendor }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize Leaflet map if not initialized
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([center.lat, center.lng], 12);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([center.lat, center.lng], 12);
    }

    // Clear existing markers
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    // Add user GPS pin marker (Blue Pulse Pin)
    const userIcon = window.L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 15px #2563eb; animation: pulse 2s infinite;"></div>`,
      iconSize: [22, 22]
    });

    const userMarker = window.L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapInstance.current)
      .bindPopup(`<div style="font-weight: bold; font-size: 12px; color: #1e293b;">📍 Your Selected GPS Location</div>`);
    markersRef.current.push(userMarker);

    // Add vendor pins (20 Vendors)
    vendors.forEach((vendor) => {
      if (!vendor.location?.coordinates) return;
      const [lng, lat] = vendor.location.coordinates;

      const vendorIcon = window.L.divIcon({
        className: 'custom-vendor-marker',
        html: `<div style="background-color: #0f172a; border: 2px solid #3b82f6; border-radius: 12px; padding: 4px 8px; color: #ffffff; font-size: 11px; font-weight: bold; display: flex; items-center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                 <span style="color: #fbbf24;">★ ${vendor.averageRating || 4.8}</span>
                 <span>${vendor.businessName.slice(0, 15)}...</span>
               </div>`,
        iconSize: [120, 28]
      });

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '200px';
      popupContent.innerHTML = `
        <div style="font-family: sans-serif; color: #0f172a;">
          <h4 style="margin: 0; font-size: 13px; font-weight: bold;">${vendor.businessName}</h4>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            ★ ${vendor.averageRating || 4.8} (${vendor.totalReviews || 80}+ reviews) • ${vendor.distanceKm || 0} km away
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            ${vendor.supportedVehicleTypes?.join(', ')}
          </div>
          <button id="book-btn-${vendor._id}" style="margin-top: 8px; width: 100%; background: #2563eb; color: #ffffff; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Book Service Slot
          </button>
        </div>
      `;

      const marker = window.L.marker([lat, lng], { icon: vendorIcon })
        .addTo(mapInstance.current)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-btn-${vendor._id}`);
        if (btn) {
          btn.onclick = () => onSelectVendor(vendor);
        }
      });

      markersRef.current.push(marker);
    });

  }, [vendors, center]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
        <span>Live OpenStreetMap View ({vendors.length} Garages Pinned)</span>
      </div>
    </div>
  );
}

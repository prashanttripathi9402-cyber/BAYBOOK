/**
 * Geolocation & Reverse Geocoding Helper Service
 * Uses OpenStreetMap Nominatim API for reverse geocoding and location resolution.
 */

export const METRO_CITIES = [
  { name: 'Bengaluru (Koramangala)', lat: 12.9345, lng: 77.6387 },
  { name: 'Bengaluru (Indiranagar)', lat: 12.9784, lng: 77.6412 },
  { name: 'Bengaluru (Whitefield)', lat: 12.9698, lng: 77.7499 },
  { name: 'Mumbai (Bandra West)', lat: 19.0596, lng: 72.8295 },
  { name: 'Delhi NCR (Connaught Place)', lat: 28.6315, lng: 77.2167 },
  { name: 'Hyderabad (Gachibowli)', lat: 17.4401, lng: 78.3489 },
  { name: 'Pune (Viman Nagar)', lat: 18.5679, lng: 73.9143 }
];

// Perform Reverse Geocoding using OpenStreetMap Nominatim
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AutoFix-App'
      }
    });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    
    const address = data.address || {};
    const suburb = address.suburb || address.neighbourhood || address.residential || address.subdistrict || '';
    const city = address.city || address.town || address.county || address.state_district || 'City';
    
    const formatted = suburb ? `${suburb}, ${city}` : data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return formatted;
  } catch (err) {
    console.warn('Geocoding fallback to lat/lng:', err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Forward Geocode search query (e.g. "HSR Layout Bengaluru")
export async function searchLocation(query) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AutoFix-App'
      }
    });
    const data = await res.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (err) {
    console.error('Location search failed:', err);
    return [];
  }
}

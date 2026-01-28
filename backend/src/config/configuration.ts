export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  overpass: {
    apiUrl: process.env.OVERPASS_API_URL || 'https://overpass-api.de/api/interpreter',
    timeout: parseInt(process.env.OVERPASS_TIMEOUT, 10) || 30000,
  },
  chile: {
    bounds: {
      minLat: -56.0,
      maxLat: -17.5,
      minLon: -75.6,
      maxLon: -66.4,
    },
  },
  nominatim: {
    apiUrl: process.env.NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org/search',
    userAgent: process.env.NOMINATIM_USER_AGENT || 'TrekkingPlacesApp/1.0 (contact@example.com)',
    enabled: process.env.NOMINATIM_ENABLED !== 'false', // Habilitado por defecto
  },
  mapbox: {
    apiKey: process.env.MAPBOX_API_KEY || '',
    apiUrl: process.env.MAPBOX_API_URL || 'https://api.mapbox.com/geocoding/v5',
    enabled: !!process.env.MAPBOX_API_KEY, // Solo habilitado si hay API key
  },
  // Mantener googleMaps por compatibilidad, pero ya no es necesario
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
});

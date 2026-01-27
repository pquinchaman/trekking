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
});

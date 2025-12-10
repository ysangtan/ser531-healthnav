/**
 * Application configuration
 * Centralized configuration for the Healthcare Navigator frontend
 */

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Feature Flags
  enableMockFallback: true,  // Enable fallback to mock data when backend is unavailable

  // Default Values
  defaultLocation: {
    lat: 33.4484,  // Phoenix, AZ
    lng: -112.0740,
  },

  defaultRadius: 25,  // miles

  // Cache Configuration
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
} as const;

export type Config = typeof config;

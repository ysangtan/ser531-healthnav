/**
 * API client for Healthcare Navigator backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check
 */
export async function healthCheck() {
  return apiRequest('/health');
}

/**
 * Search by symptom
 */
export interface SymptomSearchRequest {
  symptom: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minHcahps?: number;
  limit?: number;
}

export async function searchBySymptom(request: SymptomSearchRequest) {
  return apiRequest('/search/symptom', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Search providers
 */
export interface ProviderSearchFilters {
  symptom?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  specialties?: string[];
  minHcahps?: number;
  limit?: number;
}

export async function searchProviders(filters: ProviderSearchFilters) {
  const params = new URLSearchParams();

  if (filters.symptom) params.append('symptom', filters.symptom);
  if (filters.lat !== undefined) params.append('lat', filters.lat.toString());
  if (filters.lng !== undefined) params.append('lng', filters.lng.toString());
  if (filters.radius) params.append('radius', filters.radius.toString());
  if (filters.minHcahps) params.append('minHcahps', filters.minHcahps.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.specialties) {
    filters.specialties.forEach(s => params.append('specialties', s));
  }

  return apiRequest(`/search/providers?${params.toString()}`);
}

/**
 * Get all providers
 */
export async function getAllProviders() {
  return apiRequest('/providers');
}

/**
 * Get provider by ID
 */
export async function getProviderById(id: string) {
  return apiRequest(`/providers/${id}`);
}

/**
 * Get all hospitals
 */
export interface HospitalFilters {
  lat?: number;
  lng?: number;
  radius?: number;
}

export async function getAllHospitals(filters?: HospitalFilters) {
  const params = new URLSearchParams();

  if (filters?.lat !== undefined) params.append('lat', filters.lat.toString());
  if (filters?.lng !== undefined) params.append('lng', filters.lng.toString());
  if (filters?.radius) params.append('radius', filters.radius.toString());

  const query = params.toString();
  return apiRequest(`/hospitals${query ? '?' + query : ''}`);
}

/**
 * Get hospital by ID
 */
export async function getHospitalById(id: string) {
  return apiRequest(`/hospitals/${id}`);
}

/**
 * Search pharmacies near a location
 */
export interface PharmacySearchRequest {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

export async function searchPharmacies(request: PharmacySearchRequest) {
  const params = new URLSearchParams({
    lat: request.lat.toString(),
    lng: request.lng.toString(),
  });

  if (request.radius) params.append('radius', request.radius.toString());
  if (request.limit) params.append('limit', request.limit.toString());

  return apiRequest(`/pharmacies?${params.toString()}`);
}

/**
 * Get all specialties
 */
export async function getAllSpecialties() {
  return apiRequest('/specialties');
}

export default {
  healthCheck,
  searchBySymptom,
  searchProviders,
  getAllProviders,
  getProviderById,
  getAllHospitals,
  getHospitalById,
  searchPharmacies,
  getAllSpecialties,
};

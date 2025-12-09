/**
 * React hooks for API calls using React Query
 */

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import * as api from '../api';

/**
 * Hook for health check
 */
export function useHealthCheck(options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    ...options,
  });
}

/**
 * Hook for symptom search
 */
export function useSymptomSearch(
  request: api.SymptomSearchRequest,
  options?: UseQueryOptions
) {
  return useQuery({
    queryKey: ['symptom-search', request],
    queryFn: () => api.searchBySymptom(request),
    enabled: !!request.symptom,
    ...options,
  });
}

/**
 * Hook for provider search
 */
export function useProviderSearch(
  filters: api.ProviderSearchFilters,
  options?: UseQueryOptions
) {
  return useQuery({
    queryKey: ['provider-search', filters],
    queryFn: () => api.searchProviders(filters),
    ...options,
  });
}

/**
 * Hook for getting all providers
 */
export function useProviders(options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['providers'],
    queryFn: api.getAllProviders,
    ...options,
  });
}

/**
 * Hook for getting provider by ID
 */
export function useProvider(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => api.getProviderById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for getting all hospitals
 */
export function useHospitals(
  filters?: api.HospitalFilters,
  options?: UseQueryOptions
) {
  return useQuery({
    queryKey: ['hospitals', filters],
    queryFn: () => api.getAllHospitals(filters),
    ...options,
  });
}

/**
 * Hook for getting hospital by ID
 */
export function useHospital(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => api.getHospitalById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for searching pharmacies
 */
export function usePharmacySearch(
  request: api.PharmacySearchRequest,
  options?: UseQueryOptions
) {
  return useQuery({
    queryKey: ['pharmacy-search', request],
    queryFn: () => api.searchPharmacies(request),
    enabled: !!request.lat && !!request.lng,
    ...options,
  });
}

/**
 * Hook for getting specialties
 */
export function useSpecialties(options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: api.getAllSpecialties,
    staleTime: Infinity, // Specialties don't change
    ...options,
  });
}

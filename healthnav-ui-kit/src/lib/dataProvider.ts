/**
 * Data Provider with Automatic Fallback to Mock Data
 *
 * This module provides hooks that automatically fall back to mock data
 * when the backend API is unavailable, ensuring the app remains functional.
 */

import { useProviders, useHospitals, useProvider, useHospital, useSpecialties } from './hooks/useApi';
import { providers as mockProviders } from '@/data/providers';
import { hospitals as mockHospitals } from '@/data/hospitals';
import { pharmacies as mockPharmacies } from '@/data/pharmacies';
import { specialties as mockSpecialties } from '@/data/providers';
import type { Provider } from '@/data/providers';
import type { Hospital } from '@/data/hospitals';
import type { Pharmacy } from '@/data/pharmacies';
import { HospitalFilters } from './api';
import { config } from './config';

interface DataWithFallback<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  usingMockData: boolean;
}

/**
 * Get all providers with automatic fallback to mock data
 */
export function useProvidersWithFallback(): DataWithFallback<Provider[]> {
  const { data, isLoading, error } = useProviders();

  const shouldUseMock = config.enableMockFallback && (error || !data);

  return {
    data: shouldUseMock ? mockProviders : (data as Provider[] || []),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}

/**
 * Get a single provider by ID with fallback to mock data
 */
export function useProviderWithFallback(id: string): DataWithFallback<Provider | undefined> {
  const { data, isLoading, error } = useProvider(id);

  const shouldUseMock = config.enableMockFallback && (error || !data);
  const mockProvider = mockProviders.find(p => p.id === id);

  return {
    data: shouldUseMock ? mockProvider : (data as Provider | undefined),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}

/**
 * Get all hospitals with automatic fallback to mock data
 */
export function useHospitalsWithFallback(filters?: HospitalFilters): DataWithFallback<Hospital[]> {
  const { data, isLoading, error } = useHospitals(filters);

  const shouldUseMock = config.enableMockFallback && (error || !data);

  return {
    data: shouldUseMock ? mockHospitals : (data as Hospital[] || []),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}

/**
 * Get a single hospital by ID with fallback to mock data
 */
export function useHospitalWithFallback(id: string): DataWithFallback<Hospital | undefined> {
  const { data, isLoading, error } = useHospital(id);

  const shouldUseMock = config.enableMockFallback && (error || !data);
  const mockHospital = mockHospitals.find(h => h.id === id);

  return {
    data: shouldUseMock ? mockHospital : (data as Hospital | undefined),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}

/**
 * Get pharmacies with fallback to mock data
 * Note: Pharmacies require location, so mock data is returned when backend is unavailable
 */
export function usePharmaciesWithFallback(): DataWithFallback<Pharmacy[]> {
  return {
    data: mockPharmacies,
    isLoading: false,
    error: null,
    usingMockData: true,  // Always use mock for pharmacies in this demo
  };
}

/**
 * Get specialties with fallback to mock data
 */
export function useSpecialtiesWithFallback(): DataWithFallback<string[]> {
  const { data, isLoading, error } = useSpecialties();

  const shouldUseMock = config.enableMockFallback && (error || !data);

  return {
    data: shouldUseMock ? mockSpecialties : (data as string[] || []),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}

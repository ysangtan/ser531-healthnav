/**
 * Hook to track backend connectivity status
 * Monitors the health check endpoint to determine if backend is available
 */

import { useHealthCheck } from './useApi';

export interface BackendStatus {
  isOnline: boolean;
  status: string;
  graphdbConnected: boolean;
  mongodbConnected: boolean;
}

export function useBackendStatus(): BackendStatus {
  const { data, isError } = useHealthCheck();

  return {
    isOnline: !isError && data?.status === 'healthy',
    status: data?.status || 'offline',
    graphdbConnected: data?.graphdb_connected || false,
    mongodbConnected: data?.mongodb_connected || false,
  };
}

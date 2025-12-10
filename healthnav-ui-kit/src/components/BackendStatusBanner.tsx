/**
 * Backend Status Banner
 *
 * Displays a banner at the top of the app to inform users about backend connectivity status.
 * - Shows warning when using demo data (backend unavailable)
 * - Shows success message briefly when connected
 * - Provides retry functionality
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBackendStatus } from '@/lib/hooks/useBackendStatus';
import { useQueryClient } from '@tanstack/react-query';

export function BackendStatusBanner() {
  const { isOnline, graphdbConnected, mongodbConnected } = useBackendStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Show success message briefly when backend becomes available
  useEffect(() => {
    if (isOnline && !showSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);  // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRetry = () => {
    // Invalidate all queries to force refetch
    queryClient.invalidateQueries();
    setDismissed(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't show banner if dismissed or if backend is online and success message expired
  if (dismissed || (isOnline && !showSuccess)) {
    return null;
  }

  // Success state (backend connected)
  if (isOnline && showSuccess) {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="ml-2 text-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Connected to backend</span>
              {graphdbConnected && <span className="text-xs">• GraphDB ✓</span>}
              {mongodbConnected && <span className="text-xs">• MongoDB ✓</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Warning state (backend unavailable - using mock data)
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="ml-2 text-yellow-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium">Using demo data</span>
            <span className="text-sm text-yellow-700">
              Backend API is currently unavailable. Connect to see real-time data from the knowledge graph.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-yellow-300 hover:bg-yellow-100"
              onClick={handleRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Error State Component
 *
 * Displays error messages with optional retry functionality
 * Used when API calls fail but fallback data is available
 */

import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showFallbackMessage?: boolean;
}

export function ErrorState({
  title = "Error Loading Data",
  message = "There was a problem loading the data. Please try again.",
  onRetry,
  showFallbackMessage = true,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <p>{message}</p>
          {showFallbackMessage && (
            <p className="text-sm text-muted-foreground">
              Using demo data instead. Connect to the backend to see real-time data.
            </p>
          )}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

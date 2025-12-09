import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <span className="text-xl font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">
            Health<span className="text-primary">Nav</span>
          </span>
        </Link>

        {/* 404 Display */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-primary/20">404</h1>
          <h2 className="text-h2 font-semibold text-foreground -mt-4">Page Not Found</h2>
        </div>

        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gradient-primary text-primary-foreground gap-2">
            <Link to="/search">
              <Search className="h-4 w-4" />
              Search Providers
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
};

export default NotFound;

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Map, List, ChevronUp, ChevronDown } from "lucide-react";
import { SearchBar, type SearchFilters } from "@/components/search/SearchBar";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { MapView } from "@/components/map/MapView";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Provider } from "@/data/providers";
import { useSaved } from "@/hooks/use-saved";
import { cn } from "@/lib/utils";
import { useProvidersWithFallback, useHospitalsWithFallback, usePharmaciesWithFallback } from "@/lib/dataProvider";
import { ErrorState } from "@/components/ui/ErrorState";

const defaultFilters: SearchFilters = {
  symptom: "",
  radius: 25,
  specialties: [],
  minHcahps: 0,
};

export default function Search() {
  const navigate = useNavigate();
  const { addRecentSearch } = useSaved();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const { data: allProviders, isLoading: providersLoading, error: providersError, usingMockData } = useProvidersWithFallback();
  const { data: hospitals } = useHospitalsWithFallback();
  const { data: pharmacies } = usePharmaciesWithFallback();

  const filteredProviders = useMemo(() => {
    return allProviders.filter((provider) => {
      if (filters.symptom) {
        const symptomLower = filters.symptom.toLowerCase();
        const matchesSymptom = provider.symptoms.some((s) =>
          s.toLowerCase().includes(symptomLower)
        );
        const matchesCondition = provider.conditions.some((c) =>
          c.toLowerCase().includes(symptomLower)
        );
        const matchesName = provider.name.toLowerCase().includes(symptomLower);
        if (!matchesSymptom && !matchesCondition && !matchesName) return false;
      }
      if (provider.distance !== undefined && provider.distance > filters.radius) return false;
      if (filters.specialties.length > 0) {
        const hasMatchingSpecialty = provider.specialties.some((s) =>
          filters.specialties.includes(s)
        );
        if (!hasMatchingSpecialty) return false;
      }
      if (provider.hcahpsScore !== undefined && provider.hcahpsScore < filters.minHcahps) return false;
      return true;
    });
  }, [allProviders, filters]);

  const handleSearch = () => {
    const hasFilters = filters.symptom || filters.specialties.length > 0 || filters.minHcahps > 0;
    if (hasFilters) {
      addRecentSearch({
        id: Date.now().toString(),
        symptom: filters.symptom,
        radius: filters.radius,
        specialties: filters.specialties,
        minHcahps: filters.minHcahps,
        timestamp: new Date().toLocaleString(),
      });
    }
  };

  const handleRemoveFilter = (key: keyof SearchFilters, value?: string) => {
    if (key === "specialties" && value) {
      setFilters((f) => ({
        ...f,
        specialties: f.specialties.filter((s) => s !== value),
      }));
    } else if (key === "radius") {
      setFilters((f) => ({ ...f, radius: 25 }));
    } else if (key === "minHcahps") {
      setFilters((f) => ({ ...f, minHcahps: 0 }));
    } else if (key === "symptom") {
      setFilters((f) => ({ ...f, symptom: "" }));
    }
  };

  const handleClearAll = () => {
    setFilters(defaultFilters);
  };

  const handleViewProfile = (provider: Provider) => {
    navigate(`/provider/${provider.id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search Header */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 border-b bg-background">
        <SearchBar filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} />
        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Mobile View Toggle */}
      <div className="flex lg:hidden border-b bg-card">
        <button
          onClick={() => setMobileView("list")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            mobileView === "list"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          )}
        >
          <List className="h-4 w-4" />
          List ({filteredProviders.length})
        </button>
        <button
          onClick={() => setMobileView("map")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            mobileView === "map"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          )}
        >
          <Map className="h-4 w-4" />
          Map
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Provider List */}
        <div
          className={cn(
            "w-full lg:w-2/5 xl:w-1/3 border-r overflow-y-auto",
            mobileView === "map" && "hidden lg:block"
          )}
        >
          <div className="p-3 sm:p-4 space-y-3">
            {providersError && !usingMockData && (
              <ErrorState
                title="Failed to Load Providers"
                message={providersError.message}
              />
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {providersLoading ? (
                  "Loading providers..."
                ) : (
                  <>
                    {filteredProviders.length} provider{filteredProviders.length !== 1 && "s"} found
                    {usingMockData && <span className="ml-2 text-xs text-yellow-600">(Demo Data)</span>}
                  </>
                )}
              </p>
            </div>

            {providersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProviders.length > 0 ? (
              <div className="space-y-3">
                {filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProvider?.id === provider.id}
                    onSelect={setSelectedProvider}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No providers found"
                description="Try a different symptom or expand your search radius."
                actionLabel="Clear Filters"
                onAction={handleClearAll}
              />
            )}
          </div>
        </div>

        {/* Map - Desktop always visible, Mobile toggle */}
        <div
          className={cn(
            "flex-1 min-h-[300px] lg:min-h-0 relative",
            mobileView === "list" && "hidden lg:block"
          )}
        >
          {/* Desktop Map Collapse Toggle */}
          <div className="hidden lg:block absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="shadow-md gap-1"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
            >
              {isMapExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
          
          <MapView
            providers={filteredProviders}
            hospitals={hospitals}
            pharmacies={pharmacies}
            selectedProviderId={selectedProvider?.id}
            onProviderSelect={(provider) => {
              setSelectedProvider(provider);
              // On mobile, switch to list view when selecting from map
              if (window.innerWidth < 1024) {
                setMobileView("list");
              }
            }}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

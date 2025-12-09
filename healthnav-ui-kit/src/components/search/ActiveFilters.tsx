import { FilterChip } from "@/components/ui/filter-chip";
import type { SearchFilters } from "./SearchBar";

interface ActiveFiltersProps {
  filters: SearchFilters;
  onRemoveFilter: (key: keyof SearchFilters, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.symptom ||
    filters.specialties.length > 0 ||
    filters.minHcahps > 0 ||
    filters.radius !== 25;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {filters.symptom && (
        <FilterChip
          label="Symptom"
          value={filters.symptom}
          onRemove={() => onRemoveFilter("symptom")}
        />
      )}

      {filters.radius !== 25 && (
        <FilterChip
          label="Radius"
          value={`${filters.radius} mi`}
          onRemove={() => onRemoveFilter("radius")}
        />
      )}

      {filters.minHcahps > 0 && (
        <FilterChip
          label="Min HCAHPS"
          value={filters.minHcahps.toString()}
          onRemove={() => onRemoveFilter("minHcahps")}
        />
      )}

      {filters.specialties.map((specialty) => (
        <FilterChip
          key={specialty}
          label="Specialty"
          value={specialty}
          onRemove={() => onRemoveFilter("specialties", specialty)}
        />
      ))}

      <button
        onClick={onClearAll}
        className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

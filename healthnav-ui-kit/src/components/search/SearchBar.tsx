import { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { radiusOptions, specialties } from "@/data/providers";

export interface SearchFilters {
  symptom: string;
  radius: number;
  specialties: string[];
  minHcahps: number;
}

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export function SearchBar({ filters, onFiltersChange, onSearch }: SearchBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter((s) => s !== specialty)
      : [...filters.specialties, specialty];
    updateFilter("specialties", newSpecialties);
  };

  const activeFilterCount = filters.specialties.length + (filters.minHcahps > 0 ? 1 : 0);

  return (
    <div className="rounded-xl sm:rounded-2xl bg-card p-2 shadow-card border">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Symptom Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symptom (e.g., Chest pain)"
            value={filters.symptom}
            onChange={(e) => updateFilter("symptom", e.target.value)}
            className="pl-10 border-0 bg-muted/50 focus-visible:ring-1 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        {/* Bottom row on mobile */}
        <div className="flex gap-2">
          {/* Radius */}
          <Select
            value={filters.radius.toString()}
            onValueChange={(val) => updateFilter("radius", parseInt(val))}
          >
            <SelectTrigger className="flex-1 sm:w-28 lg:w-32 border-0 bg-muted/50 h-10 sm:h-11">
              <MapPin className="h-4 w-4 mr-1 sm:mr-2 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {radiusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-0 bg-muted/50 gap-1 sm:gap-2 h-10 sm:h-11 px-3">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 sm:w-80" align="end">
              <div className="space-y-4">
                {/* Min HCAHPS */}
                <div className="space-y-2">
                  <Label>Minimum HCAHPS Score: {filters.minHcahps}</Label>
                  <Slider
                    value={[filters.minHcahps]}
                    onValueChange={([val]) => updateFilter("minHcahps", val)}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {specialties.map((specialty) => (
                      <label
                        key={specialty}
                        className="flex items-center gap-2 text-sm cursor-pointer py-1"
                      >
                        <Checkbox
                          checked={filters.specialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        {specialty}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button 
            onClick={onSearch} 
            className="gradient-primary text-primary-foreground gap-1 sm:gap-2 h-10 sm:h-11 px-3 sm:px-4"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

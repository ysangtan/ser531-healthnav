import { MapPin, ChevronRight, Building2, GitCompare, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { SpecialtyBadge } from "@/components/ui/specialty-badge";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";
import { useToast } from "@/hooks/use-toast";
import type { Provider } from "@/data/providers";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
  isSelected?: boolean;
  onSelect?: (provider: Provider) => void;
  onViewProfile?: (provider: Provider) => void;
}

function getInitials(name: string): string {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProviderCard({ provider, isSelected, onSelect, onViewProfile }: ProviderCardProps) {
  const { addToCompare, isInCompare } = useCompare();
  const { saveProvider, unsaveProvider, isSaved } = useSaved();
  const { toast } = useToast();

  const providerInCompare = isInCompare(provider.id);
  const providerIsSaved = isSaved(provider.id);

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (providerInCompare) {
      toast({ title: "Already in compare", description: "This provider is already in your comparison list." });
    } else {
      const added = addToCompare(provider);
      if (added) {
        toast({ title: "Added to compare", description: `${provider.name} added to comparison.` });
      } else {
        toast({ title: "Compare list full", description: "Remove a provider to add another.", variant: "destructive" });
      }
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (providerIsSaved) {
      unsaveProvider(provider.id);
      toast({ title: "Removed from saved", description: `${provider.name} removed.` });
    } else {
      saveProvider(provider);
      toast({ title: "Provider saved", description: `${provider.name} saved.` });
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-card-hover",
        isSelected && "ring-2 ring-primary shadow-card-hover"
      )}
      onClick={() => onSelect?.(provider)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm sm:text-base">
            {getInitials(provider.name)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name + Quick Actions */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{provider.name}</h3>
              <div className="flex shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8",
                    providerIsSaved ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={handleSave}
                >
                  <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", providerIsSaved && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8",
                    providerInCompare ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={handleCompare}
                >
                  <GitCompare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Specialties */}
            <div className="mt-1 flex flex-wrap gap-1">
              {provider.specialties.slice(0, 2).map((specialty) => (
                <SpecialtyBadge key={specialty} specialty={specialty} />
              ))}
              {provider.specialties.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{provider.specialties.length - 2}
                </span>
              )}
            </div>

            {/* Hospital + HCAHPS */}
            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">{provider.hospitalName}</span>
              <HcahpsBadge score={provider.hcahpsScore} size="sm" showLabel={false} />
            </div>

            {/* Distance + CTA */}
            <div className="mt-2 sm:mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{provider.distance} mi</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.(provider);
                }}
              >
                View Profile
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

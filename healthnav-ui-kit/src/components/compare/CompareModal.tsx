import { X, Heart, MapPin, Building2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { SpecialtyBadge } from "@/components/ui/specialty-badge";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";
import { cn } from "@/lib/utils";

export function CompareModal() {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setCompareOpen } = useCompare();
  const { saveProvider, isSaved } = useSaved();

  if (compareList.length === 0) return null;

  const handleSaveBestMatch = () => {
    // Save the one with highest HCAHPS
    const best = [...compareList].sort((a, b) => b.hcahpsScore - a.hcahpsScore)[0];
    if (best) {
      saveProvider(best);
    }
    setCompareOpen(false);
  };

  return (
    <Dialog open={isCompareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Providers ({compareList.length}/3)</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Provider Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {compareList.map((provider) => (
              <div
                key={provider.id}
                className="relative rounded-lg border bg-card p-4"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCompare(provider.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {provider.firstName[0]}{provider.lastName[0]}
                  </div>
                  <div>
                    <Link
                      to={`/provider/${provider.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                      onClick={() => setCompareOpen(false)}
                    >
                      {provider.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isSaved(provider.id) && (
                        <Heart className="h-3 w-3 text-primary fill-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-lg border border-dashed bg-muted/30 p-4 flex items-center justify-center min-h-[120px]"
              >
                <p className="text-sm text-muted-foreground">Add provider to compare</p>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Attribute</th>
                  {compareList.map((provider) => (
                    <th key={provider.id} className="text-left py-3 px-2 font-medium">
                      {provider.lastName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Specialties */}
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">Specialties</td>
                  {compareList.map((provider) => (
                    <td key={provider.id} className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((s) => (
                          <SpecialtyBadge key={s} specialty={s} />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Hospital */}
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      Hospital
                    </div>
                  </td>
                  {compareList.map((provider) => (
                    <td key={provider.id} className="py-3 px-2 font-medium">
                      {provider.hospitalName}
                    </td>
                  ))}
                </tr>

                {/* HCAHPS */}
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">HCAHPS Score</td>
                  {compareList.map((provider) => {
                    const isBest = provider.hcahpsScore === Math.max(...compareList.map((p) => p.hcahpsScore));
                    return (
                      <td key={provider.id} className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <HcahpsBadge score={provider.hcahpsScore} showLabel={false} />
                          {isBest && compareList.length > 1 && (
                            <span className="text-xs text-success flex items-center gap-0.5">
                              <Check className="h-3 w-3" />
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Distance */}
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Distance
                    </div>
                  </td>
                  {compareList.map((provider) => {
                    const isClosest = provider.distance === Math.min(...compareList.map((p) => p.distance));
                    return (
                      <td key={provider.id} className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.distance} mi</span>
                          {isClosest && compareList.length > 1 && (
                            <span className="text-xs text-success flex items-center gap-0.5">
                              <Check className="h-3 w-3" />
                              Closest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Saved */}
                <tr>
                  <td className="py-3 px-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      Saved
                    </div>
                  </td>
                  {compareList.map((provider) => (
                    <td key={provider.id} className="py-3 px-2">
                      {isSaved(provider.id) ? (
                        <span className="text-primary flex items-center gap-1">
                          <Heart className="h-4 w-4 fill-current" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={clearCompare}>
              Clear All
            </Button>
            <Button onClick={handleSaveBestMatch} className="gradient-primary text-primary-foreground">
              <Heart className="h-4 w-4 mr-2" />
              Save Best Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

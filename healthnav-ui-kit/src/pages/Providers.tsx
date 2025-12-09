import { Link } from "react-router-dom";
import { Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SpecialtyBadge } from "@/components/ui/specialty-badge";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { providers } from "@/data/providers";

export default function Providers() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-h2 font-semibold text-foreground">All Providers</h1>
        <p className="text-muted-foreground">Browse all {providers.length} healthcare providers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Link key={provider.id} to={`/provider/${provider.id}`}>
            <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {provider.firstName[0]}{provider.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{provider.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {provider.specialties.slice(0, 2).map((s) => (
                        <SpecialtyBadge key={s} specialty={s} />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate">{provider.hospitalName}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {provider.distance} mi
                      </span>
                      <HcahpsBadge score={provider.hcahpsScore} size="sm" showLabel={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

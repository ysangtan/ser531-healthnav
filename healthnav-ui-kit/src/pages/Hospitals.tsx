import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { hospitals } from "@/data/hospitals";

export default function Hospitals() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-h2 font-semibold text-foreground">Hospitals</h1>
        <p className="text-muted-foreground">Explore hospitals with quality scores and affiliations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((hospital) => (
          <Link key={hospital.id} to={`/hospital/${hospital.id}`}>
            <Card className="h-full hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {hospital.address}, {hospital.city}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <HcahpsBadge score={hospital.hcahpsScore} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {hospital.bedCount} beds
                      </span>
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

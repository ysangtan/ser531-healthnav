import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Users, BedDouble, Siren, Phone, MapPin,
  Clock, Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HcahpsBadge, getHcahpsLevel } from "@/components/ui/hcahps-badge";
import { useHospitalWithFallback, useProvidersWithFallback, usePharmaciesWithFallback } from "@/lib/dataProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: hospital, isLoading: hospitalLoading, usingMockData } = useHospitalWithFallback(id || "");
  const { data: allProviders } = useProvidersWithFallback();
  const { data: allPharmacies } = usePharmaciesWithFallback();

  const affiliatedProviders = allProviders.filter((p) => p.hospitalId === id);
  const nearbyPharmacies = allPharmacies.slice(0, 4); // Demo: show first 4 pharmacies

  if (hospitalLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Hospital Not Found</h1>
          <p className="mt-2 text-muted-foreground">The hospital you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/hospitals")} className="mt-4">
            View All Hospitals
          </Button>
        </div>
      </div>
    );
  }

  const handleSetPreferred = () => {
    toast({
      title: "Preferred hospital set",
      description: `${hospital.name} is now your preferred hospital.`,
    });
  };

  const hcahpsLevel = getHcahpsLevel(hospital.hcahpsScore);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-4 lg:p-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Hospital Info */}
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <BedDouble className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-h2 font-semibold text-foreground">{hospital.name}</h1>
                  <HcahpsBadge score={hospital.hcahpsScore} />
                </div>
                <p className="text-sm text-muted-foreground">CMS ID: {hospital.cmsId}</p>
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                </p>
              </div>
            </div>

            {/* Actions */}
            <Button onClick={handleSetPreferred} className="gradient-primary text-primary-foreground">
              <Star className="h-4 w-4 mr-2" />
              Set as Preferred
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {hospital.about && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{hospital.about}</p>
                </CardContent>
              </Card>
            )}

            {/* Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div 
                    className={cn(
                      "flex h-24 w-24 flex-col items-center justify-center rounded-full",
                      hcahpsLevel === "excellent" && "bg-success/10",
                      hcahpsLevel === "good" && "bg-success/10",
                      hcahpsLevel === "average" && "bg-warning/10",
                      hcahpsLevel === "poor" && "bg-destructive/10"
                    )}
                  >
                    <span 
                      className={cn(
                        "text-3xl font-bold",
                        hcahpsLevel === "excellent" && "text-success",
                        hcahpsLevel === "good" && "text-success",
                        hcahpsLevel === "average" && "text-warning",
                        hcahpsLevel === "poor" && "text-destructive"
                      )}
                    >
                      {hospital.hcahpsScore}
                    </span>
                    <span className="text-xs text-muted-foreground">HCAHPS</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      The HCAHPS (Hospital Consumer Assessment of Healthcare Providers and Systems) 
                      score measures patient satisfaction based on surveys about their hospital experience.
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {hcahpsLevel === "excellent" && "This hospital has excellent patient satisfaction ratings."}
                      {hcahpsLevel === "good" && "This hospital has good patient satisfaction ratings."}
                      {hcahpsLevel === "average" && "This hospital has average patient satisfaction ratings."}
                      {hcahpsLevel === "poor" && "This hospital has below average patient satisfaction ratings."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliated Providers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Affiliated Providers</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {affiliatedProviders.length} providers
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {affiliatedProviders.slice(0, 5).map((provider) => (
                    <Link
                      key={provider.id}
                      to={`/provider/${provider.id}`}
                      className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {provider.firstName[0]}{provider.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{provider.name}</p>
                          <p className="text-sm text-muted-foreground">{provider.specialties[0]}</p>
                        </div>
                      </div>
                      {provider.distance !== undefined && (
                        <span className="text-sm text-muted-foreground">{provider.distance} mi</span>
                      )}
                    </Link>
                  ))}
                </div>
                {affiliatedProviders.length > 5 && (
                  <Button variant="ghost" className="w-full mt-4 text-primary">
                    View all {affiliatedProviders.length} providers
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Hospital Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospital.bedCount !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bed Count</p>
                      <p className="font-medium">{hospital.bedCount} beds</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Affiliated Providers</p>
                    <p className="font-medium">{hospital.affiliatedProviders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Siren className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Services</p>
                    <p className="font-medium">{hospital.emergencyServices ? "Available" : "Not Available"}</p>
                  </div>
                </div>
                {hospital.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{hospital.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nearby Pharmacies */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-neutral-500" />
                  Nearby Pharmacies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearbyPharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{pharmacy.chain || pharmacy.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pharmacy.is24Hour ? "24 Hours" : (pharmacy.hours || "Hours vary")}
                      </p>
                    </div>
                    {pharmacy.distance !== undefined && (
                      <span className="text-muted-foreground">{pharmacy.distance} mi</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full">
                  Call Hospital
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

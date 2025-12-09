import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Heart, GitCompare, Phone, MapPin, Building2, 
  Stethoscope, FileText, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { SpecialtyBadge } from "@/components/ui/specialty-badge";
import { providers } from "@/data/providers";
import { hospitals } from "@/data/hospitals";
import { useToast } from "@/hooks/use-toast";
import { useCompare } from "@/hooks/use-compare";
import { useSaved } from "@/hooks/use-saved";

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { saveProvider, unsaveProvider, isSaved } = useSaved();

  const provider = providers.find((p) => p.id === id);
  const hospital = provider ? hospitals.find((h) => h.id === provider.hospitalId) : null;

  if (!provider) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-foreground">Provider Not Found</h1>
          <p className="mt-2 text-muted-foreground">The provider you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/search")} className="mt-4">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const providerIsSaved = isSaved(provider.id);
  const providerInCompare = isInCompare(provider.id);

  const handleSave = () => {
    if (providerIsSaved) {
      unsaveProvider(provider.id);
      toast({
        title: "Removed from saved",
        description: `${provider.name} has been removed from your saved providers.`,
      });
    } else {
      saveProvider(provider);
      toast({
        title: "Provider saved",
        description: `${provider.name} has been added to your saved providers.`,
      });
    }
  };

  const handleCompare = () => {
    if (providerInCompare) {
      removeFromCompare(provider.id);
      toast({
        title: "Removed from compare",
        description: `${provider.name} has been removed from comparison.`,
      });
    } else {
      const added = addToCompare(provider);
      if (added) {
        toast({
          title: "Added to compare",
          description: `${provider.name} has been added to your comparison list.`,
        });
      } else {
        toast({
          title: "Compare list full",
          description: "You can only compare up to 3 providers at a time.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-4 lg:p-6">
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
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                {provider.firstName[0]}{provider.lastName[0]}
              </div>
              <div>
                <h1 className="text-h2 font-semibold text-foreground">{provider.name}</h1>
                <p className="text-sm text-muted-foreground">NPI: {provider.npi}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {provider.specialties.map((specialty) => (
                    <SpecialtyBadge key={specialty} specialty={specialty} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={providerIsSaved ? "default" : "outline"}
                onClick={handleSave}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${providerIsSaved ? "fill-current" : ""}`} />
                {providerIsSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant={providerInCompare ? "default" : "outline"}
                onClick={handleCompare}
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                {providerInCompare ? "In Compare" : "Compare"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {hospital && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-secondary" />
                    Affiliated Hospital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link 
                    to={`/hospital/${hospital.id}`}
                    className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{hospital.name}</p>
                      <p className="text-sm text-muted-foreground">{hospital.address}, {hospital.city}</p>
                    </div>
                    <HcahpsBadge score={hospital.hcahpsScore} />
                  </Link>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="locations"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Conditions Treated</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.conditions.map((condition) => (
                      <span key={condition} className="rounded-full bg-muted px-3 py-1 text-sm text-foreground">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Related Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.symptoms.map((symptom) => (
                      <span key={symptom} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="locations" className="mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{provider.address}</p>
                        <p className="text-sm text-muted-foreground">New York, NY</p>
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Mon-Fri: 9:00 AM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notes yet. Add your first note about this provider.</p>
                    <Button variant="outline" className="mt-4">Add Note</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{provider.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-medium">{provider.distance} miles away</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <Button className="w-full gradient-primary text-primary-foreground">
                  Request Appointment
                </Button>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

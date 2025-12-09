import { Link } from "react-router-dom";
import { Heart, Clock, Search, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpecialtyBadge } from "@/components/ui/specialty-badge";
import { HcahpsBadge } from "@/components/ui/hcahps-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useSaved } from "@/hooks/use-saved";
import { useToast } from "@/hooks/use-toast";

export default function Saved() {
  const { toast } = useToast();
  const { savedProviders, unsaveProvider, recentSearches, removeRecentSearch } = useSaved();

  const handleRemoveProvider = (id: string) => {
    unsaveProvider(id);
    toast({ title: "Provider removed", description: "Provider has been removed from your saved list." });
  };

  const handleRemoveSearch = (id: string) => {
    removeRecentSearch(id);
    toast({ title: "Search removed", description: "Search has been removed from your history." });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-h2 font-semibold text-foreground">Saved & Recent</h1>
        <p className="text-muted-foreground">Your saved providers and recent searches.</p>
      </div>

      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved" className="gap-2">
            <Heart className="h-4 w-4" />
            Saved Providers ({savedProviders.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recent Searches ({recentSearches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {savedProviders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {provider.firstName[0]}{provider.lastName[0]}
                        </div>
                        <div>
                          <Link 
                            to={`/provider/${provider.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {provider.name}
                          </Link>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.specialties.slice(0, 1).map((s) => (
                              <SpecialtyBadge key={s} specialty={s} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveProvider(provider.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate">{provider.hospitalName}</span>
                      <HcahpsBadge score={provider.hcahpsScore} size="sm" showLabel={false} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved providers"
              description="Save providers from search results to access them quickly later."
              actionLabel="Start Searching"
              onAction={() => window.location.href = "/search"}
            />
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentSearches.length > 0 ? (
            <div className="space-y-3">
              {recentSearches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            "{search.symptom || "All providers"}"
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{search.radius} miles</span>
                            {search.specialties.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{search.specialties.join(", ")}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{search.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="h-3 w-3" />
                          Run Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveSearch(search.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent searches"
              description="Your search history will appear here after you perform searches."
              actionLabel="Start Searching"
              onAction={() => window.location.href = "/search"}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

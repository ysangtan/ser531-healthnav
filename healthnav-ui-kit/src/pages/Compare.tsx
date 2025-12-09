import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { EmptyState } from "@/components/ui/empty-state";

export default function Compare() {
  const { compareList, setCompareOpen } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <EmptyState
          title="No providers to compare"
          description="Add providers to your compare list from search results or provider details."
          actionLabel="Start Searching"
          onAction={() => window.location.href = "/search"}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <GitCompare className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-h2 font-semibold text-foreground">Compare Providers</h1>
        <p className="mt-2 text-muted-foreground">
          You have {compareList.length} provider{compareList.length !== 1 && "s"} ready to compare.
        </p>
        <Button 
          onClick={() => setCompareOpen(true)} 
          className="mt-4 gradient-primary text-primary-foreground"
        >
          Open Comparison
        </Button>
      </div>
    </div>
  );
}

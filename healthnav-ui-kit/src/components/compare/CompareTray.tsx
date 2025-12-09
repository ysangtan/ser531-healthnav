import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { cn } from "@/lib/utils";

export function CompareTray() {
  const { compareList, setCompareOpen } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <Button
        onClick={() => setCompareOpen(true)}
        className="gradient-primary text-primary-foreground shadow-lg gap-2 rounded-full px-6"
      >
        <GitCompare className="h-4 w-4" />
        Compare ({compareList.length}/3)
      </Button>
    </div>
  );
}

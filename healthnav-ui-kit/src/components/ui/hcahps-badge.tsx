import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const hcahpsBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      level: {
        excellent: "bg-success/10 text-success",
        good: "bg-success/10 text-success",
        average: "bg-warning/10 text-warning",
        poor: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      level: "average",
      size: "default",
    },
  }
);

interface HcahpsBadgeProps extends VariantProps<typeof hcahpsBadgeVariants> {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function getHcahpsLevel(score: number): "excellent" | "good" | "average" | "poor" {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 70) return "average";
  return "poor";
}

export function HcahpsBadge({ score, showLabel = true, size, className }: HcahpsBadgeProps) {
  const level = getHcahpsLevel(score);

  return (
    <span className={cn(hcahpsBadgeVariants({ level, size }), className)}>
      {showLabel && <span>HCAHPS:</span>}
      <span className="font-bold">{score}</span>
    </span>
  );
}

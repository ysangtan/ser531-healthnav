import { cn } from "@/lib/utils";

interface SpecialtyBadgeProps {
  specialty: string;
  className?: string;
}

export function SpecialtyBadge({ specialty, className }: SpecialtyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary",
        className
      )}
    >
      {specialty}
    </span>
  );
}

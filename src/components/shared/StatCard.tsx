import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  isLoading?: boolean;
  hint?: string;
  accentClassName?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, isLoading, hint, accentClassName, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{label}</span>
        <Icon className={cn("size-4 text-muted-foreground", accentClassName)} />
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-2xl font-medium tabular-nums text-foreground">{value}</span>
        )}
      </div>
      {hint && !isLoading && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

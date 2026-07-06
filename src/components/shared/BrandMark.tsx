import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background",
        className
      )}
    >
      <Zap className="size-4 fill-current" />
    </div>
  );
}

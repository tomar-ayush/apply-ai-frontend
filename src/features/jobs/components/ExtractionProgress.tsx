import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExtractionProgressProps {
  active: boolean;
}

/**
 * POST /jobs parses the JD synchronously — there's no real progress percentage from the
 * server. This simulates progress up to 90% while the request is in flight so the UI still
 * feels alive, then the parent snaps it to 100% once the response resolves.
 */
export function ExtractionProgress({ active }: ExtractionProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.random() * 10 + 4));
    }, 300);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          AI agent parsing Workday listing…
        </span>
        <span className="font-mono tabular-nums">{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="mt-2" />
    </div>
  );
}

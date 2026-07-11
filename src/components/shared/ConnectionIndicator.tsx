import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkerHealthSnapshot } from "@/lib/workerHealthStore";

interface ConnectionIndicatorProps {
  workerUrl: string;
  isHealthy: boolean;
  dataUpdatedAt?: number;
}

/**
 * Pure presentational indicator. It does NOT poll — the upstream WorkerStatusCard
 * (on the jobs page) owns the /health polling and pushes the latest snapshot into the
 * shared worker-health store, which ConnectionIndicatorConnected subscribes to.
 */
export function ConnectionIndicator({ workerUrl, isHealthy, dataUpdatedAt }: ConnectionIndicatorProps) {
  // Tick once a second so the "Last checked" relative time keeps advancing
  // instead of freezing until the next cache update.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsAgo = dataUpdatedAt
    ? Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000))
    : null;

  const statusLabel = !workerUrl
    ? "Not configured"
    : isHealthy
      ? "Connected"
      : dataUpdatedAt
        ? "Unreachable"
        : "Connecting…";

  return (
    <div
      className="flex flex-col items-center gap-1 px-2 py-1.5 lg:items-stretch"
      title={`Local Playwright Agent — ${statusLabel}`}
    >
      <span className="hidden font-mono text-[10px] tracking-wide text-sidebar-foreground/40 uppercase lg:block">
        Local Playwright Agent
      </span>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            !workerUrl
              ? "bg-zinc-600"
              : isHealthy
                ? "bg-emerald-500"
                : dataUpdatedAt
                  ? "bg-rose-500"
                  : "bg-zinc-600"
          )}
        />
        <span className="hidden truncate text-sidebar-foreground/70 lg:inline">
          {statusLabel}
          {secondsAgo !== null && (
            <span className="text-sidebar-foreground/40"> · {secondsAgo}s ago</span>
          )}
        </span>
      </div>
    </div>
  );
}

/** Connected wrapper: reads the pushed worker-health snapshot and feeds ConnectionIndicator. */
export function ConnectionIndicatorConnected() {
  const { workerUrl, isHealthy, dataUpdatedAt } = useWorkerHealthSnapshot();
  return (
    <ConnectionIndicator workerUrl={workerUrl} isHealthy={isHealthy} dataUpdatedAt={dataUpdatedAt} />
  );
}

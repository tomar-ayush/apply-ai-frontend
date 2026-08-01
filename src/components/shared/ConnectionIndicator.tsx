import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkerHealth, useWorkerUrl } from "@/features/job-details/hooks/useWorkerHealth";

interface ConnectionIndicatorProps {
  workerUrl: string;
  isHealthy: boolean;
  dataUpdatedAt?: number;
}

/**
 * Presentational indicator for the local Playwright automation agent health.
 */
export function ConnectionIndicator({ workerUrl, isHealthy, dataUpdatedAt }: ConnectionIndicatorProps) {
  // Tick once a second so the "Last checked" relative time keeps advancing.
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

/** Connected wrapper: queries local agent health directly using TanStack Query. */
export function ConnectionIndicatorConnected() {
  const [workerUrl] = useWorkerUrl();
  const health = useWorkerHealth(workerUrl);
  const isHealthy = health.data?.status === "ok";
  const dataUpdatedAt = health.dataUpdatedAt || undefined;

  return (
    <ConnectionIndicator workerUrl={workerUrl} isHealthy={isHealthy} dataUpdatedAt={dataUpdatedAt} />
  );
}


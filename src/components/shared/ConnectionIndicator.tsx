import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConnectionIndicatorProps {
  isInstalled?: boolean;
}

/**
 * Presentational indicator for the ApplyAI Browser Extension status.
 */
export function ConnectionIndicator({ isInstalled = false }: ConnectionIndicatorProps) {
  const statusLabel = isInstalled ? "Connected" : "Not Connected";

  return (
    <div
      className="flex flex-col items-center gap-1 px-2 py-1.5 lg:items-stretch"
      title={`ApplyAI Chrome Extension — ${statusLabel}`}
    >
      <span className="hidden font-mono text-[10px] tracking-wide text-sidebar-foreground/40 uppercase lg:block">
        ApplyAI Extension
      </span>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            isInstalled ? "bg-emerald-500" : "bg-rose-500"
          )}
        />
        <span className="hidden truncate text-sidebar-foreground/70 lg:inline">
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

/** Connected wrapper for Chrome Extension indicator */
export function ConnectionIndicatorConnected() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "APPLYAI_EXTENSION_INSTALLED" || event.data?.type === "APPLYAI_TASK_RESPONSE") {
        setIsInstalled(true);
      }
    };

    window.addEventListener("message", handleMessage);
    // Dispatch ping to test extension connection
    window.postMessage({ type: "APPLYAI_PING" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return <ConnectionIndicator isInstalled={isInstalled} />;
}


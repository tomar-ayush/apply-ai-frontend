import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { useMe } from "@/queries/useUsersQueries";

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
  const { token } = useAuth();
  const { data: me } = useMe(!!token);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "APPLYAI_EXTENSION_INSTALLED" ||
        event.data?.type === "APPLYAI_TASK_RESPONSE"
      ) {
        setIsInstalled(true);
      }
    };

    window.addEventListener("message", handleMessage);
    // Dispatch ping to test extension connection
    window.postMessage({ type: "APPLYAI_PING" }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Automatically sync auth to extension when extension is detected and user is logged in
  useEffect(() => {
    if (isInstalled && token && me) {
      console.log("[DEBUG] Auto-syncing auth credentials to browser extension:", {
        userId: me.id,
        userEmail: me.email,
      });
      window.postMessage(
        {
          type: "APPLYAI_SYNC_AUTH",
          token: token,
          userId: me.id,
          userEmail: me.email,
          callbackUrl: import.meta.env.VITE_BACKEND_API_BASE_URL || window.location.origin,
        },
        window.location.origin
      );
    }
  }, [isInstalled, token, me]);

  return <ConnectionIndicator isInstalled={isInstalled} />;
}


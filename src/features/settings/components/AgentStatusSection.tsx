import { SectionHeading } from "@/components/shared/SectionHeading";
import { useAgentHealth } from "@/queries/useHealthQueries";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AgentStatusSection() {
  const { data, isError, dataUpdatedAt } = useAgentHealth();
  const isHealthy = !isError && data?.status === "ok";
  const lastSeenIso = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="05"
        title="Local Playwright Agent"
        description="Status of the local background Playwright application runner."
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
              isHealthy ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}
          >
            <span className={cn("size-1.5 rounded-full", isHealthy ? "bg-emerald-500" : "bg-rose-500")} />
            {isHealthy ? "Healthy" : "Unreachable"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Agent Connection</p>
          <p className="text-sm font-medium text-foreground">{isHealthy ? "Connected" : "Disconnected"}</p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Last Seen</p>
          <p className="text-sm font-medium text-foreground">{lastSeenIso ? relativeTime(lastSeenIso) : "Never"}</p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Health Status</p>
          <p className="text-sm font-medium text-foreground">{isHealthy ? "Ready" : "Not responding"}</p>
        </div>
      </div>
    </div>
  );
}

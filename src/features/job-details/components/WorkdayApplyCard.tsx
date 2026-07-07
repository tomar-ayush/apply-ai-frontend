import { useState } from "react";
import { toast } from "sonner";
import { Play, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkerHealth, useWorkerUrl } from "@/features/job-details/hooks/useWorkerHealth";
import { JobStatus } from "@/types/enums";
import type { JobResponse } from "@/types/api";

type DummyRunState = "idle" | "queued" | "running" | "applied";

/** Dummy for now — no Workday automation endpoint exists on the backend yet. */
export function WorkdayApplyCard({ job }: { job: JobResponse }) {
  const [workerUrl] = useWorkerUrl();
  const health = useWorkerHealth(workerUrl);
  const isWorkerHealthy = health.data?.status === "ok";
  const [runState, setRunState] = useState<DummyRunState>("idle");

  const isReady = job.status === JobStatus.READY_TO_APPLY;
  const canRun = isReady && !!workerUrl && isWorkerHealthy && runState === "idle";

  const disabledReason = !workerUrl
    ? "Configure the automation worker URL above first."
    : !isWorkerHealthy
      ? "The automation worker must be healthy before running automation."
      : !isReady
        ? "Job must be Ready To Apply before automation can run."
        : undefined;

  const handleRun = () => {
    setRunState("queued");
    toast.success("Workday automation queued (dummy — no backend yet)");
    setTimeout(() => setRunState("running"), 1200);
    setTimeout(() => {
      setRunState("applied");
      toast.success("Workday application submitted (dummy)");
    }, 3200);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Workflow className="size-4 text-muted-foreground" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Workday Apply</p>
            <p className="text-xs text-muted-foreground">Submits the application via the local automation worker.</p>
          </div>
        </div>
      </div>

      {runState !== "idle" && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={
              runState === "applied"
                ? "h-full w-full rounded-full bg-emerald-500 transition-all"
                : "h-full w-1/3 animate-[progress-slide_1.2s_ease-in-out_infinite] rounded-full bg-blue-500"
            }
          />
        </div>
      )}

      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={handleRun} disabled={!canRun} className="w-full">
          <Play className="size-3.5" />
          {runState === "idle" && "Run Automation"}
          {runState === "queued" && "Queued…"}
          {runState === "running" && "Running…"}
          {runState === "applied" && "Applied"}
        </Button>
        {disabledReason && runState === "idle" && <p className="mt-1.5 text-xs text-muted-foreground">{disabledReason}</p>}
      </div>
    </div>
  );
}

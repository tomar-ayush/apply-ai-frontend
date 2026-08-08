import { useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCw, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTriggerWorkday, useTaskStatus } from "@/queries/useTasksQueries";
import { JobStatus, TaskStatus } from "@/types/enums";
import type { JobResponse } from "@/types/api";

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.QUEUED]: "Queued",
  [TaskStatus.RUNNING]: "Running",
  [TaskStatus.COMPLETED]: "Completed",
  [TaskStatus.FAILED]: "Failed",
};

export function WorkdayApplyCard({ job }: { job: JobResponse }) {
  const [taskId, setTaskId] = useState<string | undefined>(undefined);
  const triggerWorkday = useTriggerWorkday(job.id);
  const taskStatus = useTaskStatus(taskId);

  const isReady =
    job.status === JobStatus.REFERRAL_RECEIVED || job.status === JobStatus.REFERRAL_NOT_RECEIVED;
  const canRun = isReady && !triggerWorkday.isPending;

  const disabledReason = !isReady
    ? "Job must have a referral outcome (received or not received) before automation can run."
    : undefined;

  const handleRun = () => {
    const resumeUrl = job.optimized_resume_pdf_url ?? job.optimized_resume_latex_url ?? "";
    triggerWorkday.mutate(
      { job_id: job.id, job_url: job.workday_url, resume_url: resumeUrl },
      {
        onSuccess: (data) => {
          setTaskId(data.task_id);
          toast.success("Workday automation queued");
        },
        onError: (error) => toast.error(`Could not queue Workday automation: ${String(error)}`),
      }
    );
  };

  const handleRefresh = () => {
    taskStatus.refetch();
    toast.message("Checking task status…");
  };

  const status = taskStatus.data?.status;

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

      {taskId && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                status === TaskStatus.COMPLETED
                  ? "bg-emerald-500"
                  : status === TaskStatus.FAILED
                    ? "bg-rose-500"
                    : status === TaskStatus.RUNNING
                      ? "bg-blue-500"
                      : "bg-zinc-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              Status: {status ? TASK_STATUS_LABEL[status] : "Unknown"}
            </span>
          </div>
          <Button size="xs" variant="ghost" onClick={handleRefresh} disabled={taskStatus.isFetching}>
            <RefreshCw className={cn("size-3", taskStatus.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      )}

      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={handleRun} disabled={!canRun} className="w-full">
          <Play className="size-3.5" />
          {triggerWorkday.isPending ? "Queuing…" : "Run Automation"}
        </Button>
        {disabledReason && !taskId && <p className="mt-1.5 text-xs text-muted-foreground">{disabledReason}</p>}
      </div>
    </div>
  );
}

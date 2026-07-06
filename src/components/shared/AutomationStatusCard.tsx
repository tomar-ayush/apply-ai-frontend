import { Play, TriangleAlert, UserPlus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TaskStatus, TaskType } from "@/types/enums";
import type { TaskResponse } from "@/types/api";

interface AutomationStatusCardProps {
  taskType: TaskType;
  task?: TaskResponse;
  onRun: () => void;
  canRun: boolean;
  isStarting?: boolean;
  disabledReason?: string;
}

const TASK_META: Record<TaskType, { label: string; description: string; icon: typeof Play }> = {
  [TaskType.WORKDAY_APPLY]: {
    label: "Workday Apply",
    description: "Submits the application via the local Playwright agent.",
    icon: Workflow,
  },
  [TaskType.LINKEDIN_CONNECT]: {
    label: "LinkedIn Connect",
    description: "Sends connection requests to referral candidates.",
    icon: UserPlus,
  },
};

export function AutomationStatusCard({ taskType, task, onRun, canRun, isStarting, disabledReason }: AutomationStatusCardProps) {
  const meta = TASK_META[taskType];
  const isRunning = task?.status === TaskStatus.RUNNING || task?.status === TaskStatus.QUEUED;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <meta.icon className="size-4 text-muted-foreground" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{meta.label}</p>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        {task && <StatusBadge kind="task" status={task.status} />}
      </div>

      {isRunning && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-[progress-slide_1.2s_ease-in-out_infinite] rounded-full bg-blue-500" />
        </div>
      )}

      {task?.status === TaskStatus.FAILED && task.error_message && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-2 text-xs text-rose-400">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{task.error_message}</span>
        </div>
      )}

      <div className="mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onRun}
          disabled={!canRun || isStarting || isRunning}
          className="w-full"
        >
          <Play className="size-3.5" />
          {isRunning ? "Running…" : isStarting ? "Starting…" : "Run Automation"}
        </Button>
        {!canRun && disabledReason && <p className="mt-1.5 text-xs text-muted-foreground">{disabledReason}</p>}
      </div>
    </div>
  );
}

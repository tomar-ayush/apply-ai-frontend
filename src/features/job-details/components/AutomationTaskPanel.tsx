import { toast } from "sonner";
import { AutomationStatusCard } from "@/components/shared/AutomationStatusCard";
import { useActiveTaskId, useCreateTask, useTask } from "@/queries/useTasksQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { JobStatus, TaskType } from "@/types/enums";
import type { JobResponse, ReferralResponse } from "@/types/api";

function TaskCard({ jobId, taskType, canRun, disabledReason }: { jobId: string; taskType: TaskType; canRun: boolean; disabledReason?: string }) {
  const [taskId, setTaskId] = useActiveTaskId(jobId, taskType);
  const taskQuery = useTask(taskId);
  const createTask = useCreateTask();

  const handleRun = () => {
    createTask.mutate(
      { jobId, taskType },
      {
        onSuccess: (task) => {
          setTaskId(task.id);
          toast.success("Automation started");
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not start automation")),
      }
    );
  };

  return (
    <AutomationStatusCard
      taskType={taskType}
      task={taskQuery.data}
      onRun={handleRun}
      canRun={canRun}
      isStarting={createTask.isPending}
      disabledReason={disabledReason}
    />
  );
}

interface AutomationTaskPanelProps {
  job: JobResponse;
  referrals: ReferralResponse[];
}

export function AutomationTaskPanel({ job, referrals }: AutomationTaskPanelProps) {
  const hasLinkedInTargets = referrals.some((r) => !!r.linkedin_url);

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">Automation</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TaskCard
          jobId={job.id}
          taskType={TaskType.WORKDAY_APPLY}
          canRun={job.status === JobStatus.READY_TO_APPLY}
          disabledReason="Job must be Ready To Apply before automation can run."
        />
        <TaskCard
          jobId={job.id}
          taskType={TaskType.LINKEDIN_CONNECT}
          canRun={hasLinkedInTargets}
          disabledReason="Add a LinkedIn URL to at least one referral first."
        />
      </div>
    </div>
  );
}

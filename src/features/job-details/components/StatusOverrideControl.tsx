import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_STATUS_MAP } from "@/lib/statusMaps";
import { VALID_JOB_TRANSITIONS, type JobStatus } from "@/types/enums";
import { useUpdateJobStatus } from "@/queries/useJobsQueries";

export function StatusOverrideControl({ jobId, status }: { jobId: string; status: JobStatus }) {
  const updateStatus = useUpdateJobStatus(jobId);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);

  const transitions = VALID_JOB_TRANSITIONS[status] ?? [];

  const handleConfirm = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(pendingStatus, {
      onSuccess: () => {
        toast.success(`Status updated to ${JOB_STATUS_MAP[pendingStatus].label}`);
        setPendingStatus(null);
      },
      onError: () => toast.error("Could not update status"),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <StatusBadge kind="job" status={status} />
      {transitions.length > 0 && (
        <Select value="" onValueChange={(v) => setPendingStatus(v as JobStatus)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Move to…" />
          </SelectTrigger>
          <SelectContent>
            {transitions.map((next) => (
              <SelectItem key={next} value={next}>
                {JOB_STATUS_MAP[next].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title="Change job status?"
        description={
          pendingStatus
            ? `Move this job from ${JOB_STATUS_MAP[status].label} to ${JOB_STATUS_MAP[pendingStatus].label}?`
            : ""
        }
        confirmLabel="Update status"
        isPending={updateStatus.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

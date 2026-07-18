import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_STATUS_MAP } from "@/lib/statusMaps";
import { VALID_JOB_TRANSITIONS, type JobStatus } from "@/types/enums";
import { useUpdateJobStatus } from "@/queries/useJobsQueries";

export function StatusOverrideControl({
  jobId,
  status,
  referralReceived,
}: {
  jobId: string;
  status: JobStatus;
  referralReceived?: boolean;
}) {
  const updateStatus = useUpdateJobStatus(jobId);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);

  const transitions = VALID_JOB_TRANSITIONS[status] ?? [];

  const handleConfirm = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(pendingStatus, {
      onSuccess: () => {
        toast.success(`Status updated to ${JOB_STATUS_MAP[pendingStatus].label}`);
        setPendingStatus(null);
      {referralReceived && (
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-transparent bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase text-emerald-400">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          Referral received
        </span>
      )}
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

import { JOB_STATUS_MAP, REFERRAL_STATUS_MAP, TASK_STATUS_MAP } from "@/lib/statusMaps";
import type { JobStatus, ReferralStatus, TaskStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

type StatusBadgeProps =
  | { kind: "job"; status: JobStatus; className?: string }
  | { kind: "referral"; status: ReferralStatus; className?: string }
  | { kind: "task"; status: TaskStatus; className?: string };

export function StatusBadge({ kind, status, className }: StatusBadgeProps) {
  const visual =
    kind === "job"
      ? JOB_STATUS_MAP[status]
      : kind === "referral"
        ? REFERRAL_STATUS_MAP[status]
        : TASK_STATUS_MAP[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        visual.bgClassName,
        visual.textClassName,
        className
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", visual.dotClassName)} />
      {visual.label}
    </span>
  );
}

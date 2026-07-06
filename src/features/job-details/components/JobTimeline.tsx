import { Timeline } from "@/components/shared/Timeline";
import { JOB_STATUS_MAP } from "@/lib/statusMaps";
import type { JobResponse } from "@/types/api";

/**
 * The API has no status-history endpoint, only created_at/updated_at + the current status.
 * This renders the two data points we actually have rather than fabricating a fuller history.
 */
export function JobTimeline({ job }: { job: JobResponse }) {
  const entries = [
    { label: `Current: ${JOB_STATUS_MAP[job.status].label}`, timestamp: job.updated_at, isCurrent: true },
    { label: "Job added to ApplyAI", timestamp: job.created_at },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-4 text-sm font-medium text-foreground">Timeline</p>
      <Timeline entries={entries} />
    </div>
  );
}

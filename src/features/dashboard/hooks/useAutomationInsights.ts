import { useMemo } from "react";
import { JobStatus } from "@/types/enums";
import type { JobDetailResponse } from "@/types/api";

export interface AutomationInsight {
  id: string;
  tone: "warning" | "success" | "info";
  jobId: string;
  message: string;
  actionLabel: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Derived, computed live from the current jobs list — flags jobs in JD_PARSED state for >24 hours. */
export function useAutomationInsights(jobs: JobDetailResponse[] | undefined): AutomationInsight[] {
  return useMemo(() => {
    const list = jobs ?? [];
    const insights: AutomationInsight[] = [];

    for (const job of list) {
      const label = [job.company, job.role].filter(Boolean).join(" — ") || "This job";
      const lastUpdatedMs = new Date(job.updated_at || job.created_at).getTime();
      const diffMs = Date.now() - lastUpdatedMs;

      // Filter jobs in JD_PARSED status that were updated over 24 hours ago
      if (job.status === JobStatus.JD_PARSED && diffMs >= DAY_MS) {
        const hoursAgo = Math.floor(diffMs / (60 * 60 * 1000));
        const daysAgo = Math.floor(hoursAgo / 24);
        const durationStr = daysAgo >= 1 ? `${daysAgo} day${daysAgo === 1 ? "" : "s"}` : `${hoursAgo} hours`;

        insights.push({
          id: `${job.id}-jd-parsed-stale`,
          tone: "warning",
          jobId: job.id,
          message: `${label} has been in JD_PARSED state for over ${durationStr}. Action required to progress.`,
          actionLabel: "Take action",
        });
      }
    }

    return insights;
  }, [jobs]);
}

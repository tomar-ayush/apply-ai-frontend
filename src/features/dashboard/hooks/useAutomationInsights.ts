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

/** Derived, computed live from the current jobs list — there is no dedicated insights/notifications endpoint. */
export function useAutomationInsights(jobs: JobDetailResponse[] | undefined): AutomationInsight[] {
  return useMemo(() => {
    const list = jobs ?? [];
    const insights: AutomationInsight[] = [];

    for (const job of list) {
      const label = [job.company, job.role].filter(Boolean).join(" — ") || "This job";
      const hoursSinceUpdate = (Date.now() - new Date(job.updated_at).getTime()) / (60 * 60 * 1000);

      if (job.status === JobStatus.REFERRAL_NOT_RECEIVED && Date.now() - new Date(job.updated_at).getTime() > DAY_MS) {
        insights.push({
          id: `${job.id}-waiting`,
          tone: "warning",
          jobId: job.id,
          message: `${label} has been marked referral not received for over ${Math.floor(hoursSinceUpdate / 24)} day${Math.floor(hoursSinceUpdate / 24) === 1 ? "" : "s"}.`,
          actionLabel: "View job",
        });
      }
    }

    return insights.sort((a, b) => (a.tone === "warning" ? -1 : b.tone === "warning" ? 1 : 0));
  }, [jobs]);
}

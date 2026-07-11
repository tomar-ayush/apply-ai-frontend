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

      if (job.status === JobStatus.WAITING_FOR_REFERRAL && Date.now() - new Date(job.updated_at).getTime() > DAY_MS) {
        insights.push({
          id: `${job.id}-waiting`,
          tone: "warning",
          jobId: job.id,
          message: `${label} has been waiting for a referral for over ${Math.floor(hoursSinceUpdate / 24)} day${Math.floor(hoursSinceUpdate / 24) === 1 ? "" : "s"}.`,
          actionLabel: "View job",
        });
      }

      if (job.status === JobStatus.RESUME_GENERATED) {
        insights.push({
          id: `${job.id}-resume`,
          tone: "success",
          jobId: job.id,
          message: `${label} resume has been optimized and is ready to review.`,
          actionLabel: "Review resume",
        });
      }

      if (job.status === JobStatus.READY_TO_APPLY) {
        insights.push({
          id: `${job.id}-ready`,
          tone: "info",
          jobId: job.id,
          message: `${label} is ready to apply — automation can run now.`,
          actionLabel: "Run automation",
        });
      }
    }

    return insights.sort((a, b) => (a.tone === "warning" ? -1 : b.tone === "warning" ? 1 : 0));
  }, [jobs]);
}

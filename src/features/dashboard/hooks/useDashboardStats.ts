import { useMemo } from "react";
import { JobStatus } from "@/types/enums";
import type { JobDetailResponse } from "@/types/api";

export function useDashboardStats(jobs: JobDetailResponse[] | undefined) {
  return useMemo(() => {
    const list = jobs ?? [];
    return {
      total: list.length,
      waitingForReferral: list.filter((j) => j.status === JobStatus.WAITING_FOR_REFERRAL).length,
      applied: list.filter((j) => j.status === JobStatus.APPLIED).length,
      oa: list.filter((j) => j.status === JobStatus.OA).length,
      interviews: list.filter((j) => j.status === JobStatus.INTERVIEW).length,
    };
  }, [jobs]);
}

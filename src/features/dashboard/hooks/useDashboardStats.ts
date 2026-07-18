import { useMemo } from "react";
import { JobStatus } from "@/types/enums";
import type { JobDetailResponse } from "@/types/api";

export function useDashboardStats(jobs: JobDetailResponse[] | undefined) {
  return useMemo(() => {
    const list = jobs ?? [];
    return {
      total: list.length,
      jdParsed: list.filter((j) => j.status === JobStatus.JD_PARSED).length,
      referred: list.filter((j) => j.status === JobStatus.REFERRAL_RECEIVED).length,
      applied: list.filter((j) => j.status === JobStatus.APPLIED).length,
      oa: list.filter((j) => j.status === JobStatus.OA).length,
      interviews: list.filter((j) => j.status === JobStatus.INTERVIEW).length,
    };
  }, [jobs]);
}

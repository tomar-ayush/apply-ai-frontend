import { apiClient } from "@/services/apiClient";
import type { JobJDResponse } from "@/types/api";

export const jobJdService = {
  async get(jobId: string): Promise<JobJDResponse> {
    const { data } = await apiClient.get<JobJDResponse>(`/jobs/${jobId}/jd`);
    return data;
  },
  async reparse(jobId: string): Promise<JobJDResponse> {
    const { data } = await apiClient.post<JobJDResponse>(`/jobs/${jobId}/parse`);
    return data;
  },
};

import { apiClient } from "@/services/apiClient";
import type { JobJDResponse, UpdateJobJdRequest } from "@/types/api";

export const jobJdService = {
  async get(jobId: string): Promise<JobJDResponse> {
    const { data } = await apiClient.get<JobJDResponse>(`/jobs/${jobId}/jd`);
    return data;
  },
  async reparse(jobId: string): Promise<JobJDResponse> {
    const { data } = await apiClient.post<JobJDResponse>(`/jobs/${jobId}/parse`);
    return data;
  },
  async update(jobId: string, payload: UpdateJobJdRequest): Promise<JobJDResponse> {
    const { data } = await apiClient.patch<JobJDResponse>(`/jobs/${jobId}/jd`, payload);
    return data;
  },
};

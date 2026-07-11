import { apiClient } from "@/services/apiClient";
import type { JobDetailResponse, JobListResponse, JobResponse } from "@/types/api";
import type { JobStatus } from "@/types/enums";

export const jobsService = {
  async list(status?: JobStatus): Promise<JobListResponse> {
    const { data } = await apiClient.get<JobListResponse>("/jobs", {
      params: status ? { status } : undefined,
    });
    return data;
  },
  async get(id: string): Promise<JobResponse> {
    const { data } = await apiClient.get<JobResponse>(`/jobs/${id}`);
    return data;
  },
  async create(workday_url: string, ai: boolean): Promise<JobDetailResponse> {
    console.debug("[debug][jobsService.create] workday_url", workday_url, "ai", ai);

    const { data } = await apiClient.post<JobDetailResponse>("/jobs", { workday_url, ai });
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}`);
  },
  async updateStatus(id: string, status: JobStatus): Promise<JobResponse> {
    const { data } = await apiClient.patch<JobResponse>(`/jobs/${id}/status`, { status });
    return data;
  },
};

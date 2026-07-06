import { apiClient } from "@/services/apiClient";
import type { GenerateResumeResponse, ResumeResponse } from "@/types/api";
import type { ResumeVersion } from "@/types/enums";

export const resumeService = {
  async generate(jobId: string): Promise<GenerateResumeResponse> {
    const { data } = await apiClient.post<GenerateResumeResponse>(`/jobs/${jobId}/resume/generate`);
    return data;
  },
  async get(jobId: string, version: ResumeVersion): Promise<ResumeResponse> {
    const { data } = await apiClient.get<ResumeResponse>(`/jobs/${jobId}/resume`, { params: { version } });
    return data;
  },
  async select(jobId: string, version: ResumeVersion): Promise<ResumeResponse> {
    const { data } = await apiClient.post<ResumeResponse>(`/jobs/${jobId}/resume/select`, { version });
    return data;
  },
};

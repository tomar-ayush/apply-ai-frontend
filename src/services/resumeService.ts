import { apiClient } from "@/services/apiClient";
import type {
  DownloadResumeResponse,
  FinalizeResumeResponse,
  GenerateResumeResponse,
  PresignedUploadUrlResponse,
  ResumeResponse,
} from "@/types/api";
import type { ResumeVersion } from "@/types/enums";

export const resumeService = {
  /** Step 1: get a presigned PUT url for the original LaTeX file. */
  async getUploadUrl(): Promise<PresignedUploadUrlResponse> {
    const { data } = await apiClient.post<PresignedUploadUrlResponse>("/resumes/upload-url");
    return data;
  },

  /** Step 2: upload the raw .tex content directly to R2 (PUT, not through our API). */
  async uploadLatex(presignedUrl: string, tex: string): Promise<void> {
    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/x-tex" },
      body: tex,
    });
  },

  /** Step 3: compile the uploaded LaTeX to a PDF (original). */
  async finalizeOriginal(): Promise<FinalizeResumeResponse> {
    const { data } = await apiClient.post<FinalizeResumeResponse>("/resumes/finalize/original");
    return data;
  },

  /** Step 4: generate the AI-optimized resume (server-side LaTeX -> PDF). */
  async generate(jobId: string): Promise<GenerateResumeResponse> {
    const { data } = await apiClient.post<GenerateResumeResponse>(`/resumes/generate/${jobId}`);
    return data;
  },

  /** Step 5: get a presigned GET url for a compiled PDF (original | ai). */
  async getDownloadUrl(version: ResumeVersion): Promise<DownloadResumeResponse> {
    const { data } = await apiClient.get<DownloadResumeResponse>(`/resumes/download/${version}`);
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

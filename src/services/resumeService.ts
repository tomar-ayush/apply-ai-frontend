import { apiClient } from "@/services/apiClient";
import type {
  DownloadResumeResponse,
  FinalizeResumeResponse,
  GenerateResumeResponse,
  PresignedUploadUrlResponse,
} from "@/types/api";
import { ResumeVersion } from "@/types/enums";

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

  async preview(jobId: string, request: import("@/types/api").PreviewRequest): Promise<import("@/types/api").PreviewResponse> {
    const { data } = await apiClient.post<import("@/types/api").PreviewResponse>(`/resumes/preview/${jobId}`, request);
    return data;
  },

  async finalizeAi(jobId: string, request: import("@/types/api").FinalizeRequest): Promise<import("@/types/api").FinalizeResponse> {
    const { data } = await apiClient.post<import("@/types/api").FinalizeResponse>(`/resumes/finalize-ai/${jobId}`, request);
    return data;
  },

  /** Step 5: get a presigned GET url for a compiled PDF (isPdf=true) or LaTeX source (isPdf=false). */
  async getDownloadUrl(version: ResumeVersion, jobId?: string, isPdf = true): Promise<DownloadResumeResponse> {
    // Backend path segment is "original" or "ai" (not "optimized").
    const pathSegment = version === ResumeVersion.OPTIMIZED ? "ai" : version;
    const idSegment = jobId || "default";
    const { data } = await apiClient.get<DownloadResumeResponse>(`/resumes/download/${pathSegment}`, {
      params: { isPdf, job_id: idSegment },
    });
    return data;
  },

  /** Helper to fetch the raw .tex LaTeX content string for a given version and jobId. */
  async getLatexSource(version: ResumeVersion, jobId?: string): Promise<string> {
    const res = await this.getDownloadUrl(version, jobId, false);
    if (!res.download_url) return "";
    const response = await fetch(res.download_url, { cache: "no-cache" });
    if (!response.ok) return "";
    return response.text();
  },

  /** Step 6: compile custom LaTeX for a specific job's AI resume and update stored URLs. */
  async compileJobResume(jobId: string, latex: string): Promise<DownloadResumeResponse> {
    const { data } = await apiClient.post<DownloadResumeResponse>(`/resumes/compile/${jobId}`, {
      latex,
    });
    return data;
  },
};

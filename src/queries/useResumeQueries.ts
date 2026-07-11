import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/resumeService";
import { queryKeys } from "@/queries/queryKeys";
import { ResumeVersion } from "@/types/enums";

// The original resume is a single global copy (cached once, shared across all job
// pages). The AI resume is generated per-job, so it stays job-scoped and refetches
// when you switch jobs. jobId is required to enable the query either way.
export function useJobResume(jobId: string | undefined, version: ResumeVersion) {
  const queryKey =
    version === ResumeVersion.ORIGINAL
      ? queryKeys.resumeVersion(version)
      : queryKeys.jobResume(jobId ?? "", version);
  return useQuery({
    queryKey,
    queryFn: () => resumeService.getDownloadUrl(version),
    enabled: !!jobId,
    retry: false,
  });
}

/** Uploads a LaTeX file (raw .tex string) to R2 and compiles it to the original PDF. */
export function useUploadLatex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tex: string) => {
      const { latex_presigned_url } = await resumeService.getUploadUrl();
      await resumeService.uploadLatex(latex_presigned_url, tex);
      return resumeService.finalizeOriginal();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersion(ResumeVersion.ORIGINAL) });
    },
  });
}

export function useGenerateResume(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sections: string[]) => resumeService.generate(jobId, sections),
    onSuccess: () => {
      // The AI resume is job-specific — invalidate only this job's ai copy.
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

/** Fetches a fresh presigned GET url for a compiled PDF and reloads it from R2. */
export function useRefreshResumeDownload(version: ResumeVersion) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resumeService.getDownloadUrl(version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersion(version) });
    },
  });
}

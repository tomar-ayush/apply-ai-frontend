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
    queryFn: () => resumeService.getDownloadUrl(version, jobId),
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
    onMutate: async () => {
      // Cancel any outgoing refetches for this job's optimized resume so they don't overwrite our null state
      await queryClient.cancelQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
      // Immediately clear cached optimized resume for this job so previous diff is invalidated
      queryClient.setQueryData(queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED), null);
    },
    onSuccess: () => {
      // Fetch the new optimized resume copy now that generation has finished
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
    },
  });
}

/** Fetches a fresh presigned GET url for a compiled PDF and reloads it from R2. */
export function useRefreshResumeDownload(version: ResumeVersion, jobId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resumeService.getDownloadUrl(version, jobId),
    onSuccess: () => {
      if (jobId && version === ResumeVersion.OPTIMIZED) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, version) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.resumeVersion(version) });
      }
    },
  });
}

/** Fetches the raw .tex LaTeX content for a job's resume. */
export function useJobResumeLatex(jobId: string | undefined, version: ResumeVersion) {
  return useQuery({
    queryKey: ["jobs", jobId ?? "", "resume-latex", version],
    queryFn: () => resumeService.getLatexSource(version, jobId),
    enabled: !!jobId,
    retry: false,
  });
}

/** Compiles custom LaTeX for a job's AI resume and updates stored PDF URL. */
export function useCompileJobResume(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (latex: string) => resumeService.compileJobResume(jobId, latex),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
      queryClient.setQueryData(queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED), null);
    },
    onSuccess: (data) => {
      // Directly update the query cache with the POST response (download_url & message)
      queryClient.setQueryData(queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
    },
  });
}

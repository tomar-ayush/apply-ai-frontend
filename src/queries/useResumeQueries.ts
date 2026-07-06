import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/resumeService";
import { queryKeys } from "@/queries/queryKeys";
import { ResumeVersion } from "@/types/enums";

export function useJobResume(jobId: string | undefined, version: ResumeVersion) {
  return useQuery({
    queryKey: queryKeys.jobResume(jobId ?? "", version),
    queryFn: () => resumeService.get(jobId!, version),
    enabled: !!jobId,
    retry: false,
  });
}

export function useGenerateResume(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resumeService.generate(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, ResumeVersion.OPTIMIZED) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

export function useSelectResumeVersion(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: ResumeVersion) => resumeService.select(jobId, version),
    onSuccess: (_data, version) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobResume(jobId, version) });
    },
  });
}

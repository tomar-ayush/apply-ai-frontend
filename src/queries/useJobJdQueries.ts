import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobJdService } from "@/services/jobJdService";
import { queryKeys } from "@/queries/queryKeys";
import { JobStatus } from "@/types/enums";
import type { JobResponse } from "@/types/api";

export function useJobJd(job: JobResponse | undefined) {
  const enabled = !!job && job.status !== JobStatus.NEW;
  return useQuery({
    queryKey: queryKeys.jobJd(job?.id ?? ""),
    queryFn: () => jobJdService.get(job!.id),
    enabled,
    retry: false,
  });
}

export function useReparseJd(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => jobJdService.reparse(jobId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.jobJd(jobId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

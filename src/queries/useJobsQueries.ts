import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobsService";
import { queryKeys } from "@/queries/queryKeys";
import type { JobStatus } from "@/types/enums";
import type { JobListResponse, JobDetailResponse } from "@/types/api";

export function useJobsList(status?: JobStatus) {
  return useQuery({
    queryKey: queryKeys.jobs(status),
    queryFn: () => jobsService.list(status),
    select: (data) => data.items,
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.job(id ?? ""),
    queryFn: () => jobsService.get(id!),
    enabled: !!id,
  });
}

/**
 * Reads the full job detail (including company/role/workday_job_id) from the cached
 * jobs list without spawning a duplicate list observer or extra network requests.
 */
export function useJobFromList(id: string | undefined): JobDetailResponse | undefined {
  const queryClient = useQueryClient();
  if (!id) return undefined;

  const queries = queryClient.getQueriesData<JobListResponse>({ queryKey: ["jobs"] });
  for (const [, data] of queries) {
    if (data?.items) {
      const match = data.items.find((job) => job.id === id);
      if (match) return match;
    }
  }
  return undefined;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workdayUrl, ai }: { workdayUrl: string; ai: boolean }) =>
      jobsService.create(workdayUrl, ai),
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (newJob?.id) {
        queryClient.setQueryData(queryKeys.job(newJob.id), newJob);
      }
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJobStatus(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: JobStatus) => jobsService.updateStatus(jobId, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.job(jobId) });
      const previous = queryClient.getQueryData(queryKeys.job(jobId));
      queryClient.setQueryData(queryKeys.job(jobId), (old: unknown) =>
        old ? { ...old, status } : old
      );
      return { previous };
    },
    onError: (_err, _status, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.job(jobId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}


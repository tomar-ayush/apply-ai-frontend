import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobsService";
import { queryKeys } from "@/queries/queryKeys";
import type { JobStatus } from "@/types/enums";
import type { JobDetailResponse } from "@/types/api";

export function useJobsList(status?: JobStatus) {
  return useQuery({
    queryKey: queryKeys.jobs(status),
    queryFn: () => jobsService.list(status),
    refetchInterval: 15_000,
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
 * Reads the full job detail (including company/role/workday_job_id) from the jobs
 * list. GET /jobs/{id} omits those fields, so the detail page sources them from
 * the list (JobDetailResponse), which denormalizes them — even for NEW jobs.
 */
export function useJobFromList(id: string | undefined) {
  // Fetch the list on demand (no refetchInterval) so the detail page always has
  // company/role, even on direct navigation. This does NOT inherit the jobs page's
  // 15s polling because that interval lives on the useJobsList observer, not here.
  const list = useQuery({
    queryKey: queryKeys.jobs(),
    queryFn: () => jobsService.list(),
    enabled: !!id,
  });
  const match = list.data?.items?.find((job: JobDetailResponse) => job.id === id);
  return match;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workdayUrl, ai }: { workdayUrl: string; ai: boolean }) =>
      jobsService.create(workdayUrl, ai),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobsService";
import { queryKeys } from "@/queries/queryKeys";
import type { JobStatus } from "@/types/enums";

export function useJobsList(status?: JobStatus) {
  return useQuery({
    queryKey: queryKeys.jobs(status),
    queryFn: () => jobsService.list(status),
    refetchInterval: 15_000,
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.job(id ?? ""),
    queryFn: () => jobsService.get(id!),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workdayUrl: string) => jobsService.create(workdayUrl),
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

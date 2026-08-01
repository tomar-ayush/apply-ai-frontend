import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasksService";
import { queryKeys } from "@/queries/queryKeys";
import { TaskStatus } from "@/types/enums";
import type { TriggerWorkdayRequest } from "@/types/api";

export function useTriggerWorkday(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TriggerWorkdayRequest) => tasksService.triggerWorkday(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

/** Fetches a single task's status and automatically polls while QUEUED or RUNNING. */
export function useTaskStatus(taskId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.task(taskId ?? ""),
    queryFn: async () => {
      const res = await tasksService.getStatus(taskId!);
      if (res.status === TaskStatus.COMPLETED || res.status === TaskStatus.FAILED) {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
      }
      return res;
    },
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === TaskStatus.QUEUED || status === TaskStatus.RUNNING) {
        return 3_000;
      }
      return false;
    },
    retry: false,
  });
}


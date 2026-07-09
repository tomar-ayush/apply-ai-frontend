import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasksService";
import { queryKeys } from "@/queries/queryKeys";
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

/** Fetches a single task's status on demand (no polling) — call refetch() to refresh. */
export function useTaskStatus(taskId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.task(taskId ?? ""),
        queryFn: () => tasksService.getStatus(taskId!),
        enabled: !!taskId,
        retry: false,
    });
}

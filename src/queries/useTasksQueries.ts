import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { tasksService } from "@/services/tasksService";
import { queryKeys } from "@/queries/queryKeys";
import { TERMINAL_TASK_STATUSES, type TaskType } from "@/types/enums";
import type { TaskResponse } from "@/types/api";

function activeTaskStorageKey(jobId: string, taskType: TaskType) {
  return `applyai_active_task_${jobId}_${taskType}`;
}

/** Tracks which task id belongs to a job+type pair — the API has no "list tasks by job" endpoint. */
export function useActiveTaskId(jobId: string, taskType: TaskType) {
  const [taskId, setTaskIdState] = useState<string | undefined>(
    () => localStorage.getItem(activeTaskStorageKey(jobId, taskType)) ?? undefined
  );

  const setTaskId = useCallback(
    (id: string | undefined) => {
      setTaskIdState(id);
      if (id) {
        localStorage.setItem(activeTaskStorageKey(jobId, taskType), id);
      } else {
        localStorage.removeItem(activeTaskStorageKey(jobId, taskType));
      }
    },
    [jobId, taskType]
  );

  return [taskId, setTaskId] as const;
}

export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.task(taskId ?? ""),
    queryFn: () => tasksService.get(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_TASK_STATUSES.includes(status)) return false;
      return status === "RUNNING" ? 2000 : 4000;
    },
    refetchIntervalInBackground: false,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, taskType }: { jobId: string; taskType: TaskType }) =>
      tasksService.create({ job_id: jobId, task_type: taskType }),
    onSuccess: (task: TaskResponse) => {
      queryClient.setQueryData(queryKeys.task(task.id), task);
    },
  });
}

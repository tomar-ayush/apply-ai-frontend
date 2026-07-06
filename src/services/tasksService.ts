import { apiClient } from "@/services/apiClient";
import type { CreateTaskRequest, TaskResponse } from "@/types/api";

export const tasksService = {
  async create(payload: CreateTaskRequest): Promise<TaskResponse> {
    const { data } = await apiClient.post<TaskResponse>("/tasks", payload);
    return data;
  },
  async get(taskId: string): Promise<TaskResponse> {
    const { data } = await apiClient.get<TaskResponse>(`/tasks/${taskId}`);
    return data;
  },
};

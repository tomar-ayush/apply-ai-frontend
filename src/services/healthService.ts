import { apiClient } from "@/services/apiClient";
import type { HealthResponse } from "@/types/api";

export const healthService = {
  async check(): Promise<HealthResponse> {
    const { data } = await apiClient.get<HealthResponse>("/health");
    return data;
  },
};

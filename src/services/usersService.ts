import { apiClient } from "@/services/apiClient";
import type { UpdateUserRequest, UserProfile } from "@/types/api";

export const usersService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/users/me");
    return data;
  },
  async updateMe(payload: UpdateUserRequest): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>("/users/me", payload);
    return data;
  },
  async updateLinkedinMessage(linkedin_message: string): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>("/users/me/linkedin-message", { linkedin_message });
    return data;
  },
};

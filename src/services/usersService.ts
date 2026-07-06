import { apiClient } from "@/services/apiClient";
import type { ResumeUploadResponse, UpdateUserRequest, UserProfile } from "@/types/api";

export const usersService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>("/users/me");
    return data;
  },
  async updateMe(payload: UpdateUserRequest): Promise<UserProfile> {
    const { data } = await apiClient.patch<UserProfile>("/users/me", payload);
    return data;
  },
  async uploadResume(formData: FormData): Promise<ResumeUploadResponse> {
    const { data } = await apiClient.post<ResumeUploadResponse>("/users/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async getResume(): Promise<ResumeUploadResponse> {
    const { data } = await apiClient.get<ResumeUploadResponse>("/users/resume");
    return data;
  },
};

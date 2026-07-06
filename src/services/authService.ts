import { apiClient } from "@/services/apiClient";
import type { TokenResponse } from "@/types/api";

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/register", payload);
    return data;
  },
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/login", payload);
    return data;
  },
};

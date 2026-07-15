import { apiClient } from "@/services/apiClient";
import type {
  ConnectReferralRequest,
  ConnectReferralResponse,
  CreateReferralsRequest,
  GenerateReferralsResponse,
  ReferralResponse,
  UpdateReferralRequest,
} from "@/types/api";

export const referralsService = {
  async listByJob(jobId: string): Promise<ReferralResponse[]> {
    const { data } = await apiClient.get<ReferralResponse[]>(`/jobs/${jobId}/referrals`);
    return data;
  },
  async createMany(jobId: string, payload: CreateReferralsRequest): Promise<ReferralResponse[]> {
    const { data } = await apiClient.post<ReferralResponse[]>(`/jobs/${jobId}/referrals`, payload);
    return data;
  },
  async generate(jobId: string): Promise<GenerateReferralsResponse> {
    const { data } = await apiClient.post<GenerateReferralsResponse>(`/jobs/${jobId}/referrals/generate`);
    return data;
  },
  async update(referralId: string, payload: UpdateReferralRequest): Promise<ReferralResponse> {
    const { data } = await apiClient.patch<ReferralResponse>(`/referrals/${referralId}`, payload);
    return data;
  },
  async remove(referralId: string): Promise<void> {
    await apiClient.delete(`/referrals/${referralId}`);
  },
  async connect(referralId: string, payload: ConnectReferralRequest): Promise<ConnectReferralResponse> {
    const { data } = await apiClient.post<ConnectReferralResponse>(`/referrals/${referralId}/connect`, payload);
    return data;
  },
};

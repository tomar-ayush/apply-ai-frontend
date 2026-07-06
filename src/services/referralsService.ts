import { apiClient } from "@/services/apiClient";
import type { GenerateReferralsResponse, ReferralResponse, UpdateReferralRequest } from "@/types/api";

export const referralsService = {
  async listByJob(jobId: string): Promise<ReferralResponse[]> {
    const { data } = await apiClient.get<ReferralResponse[]>(`/jobs/${jobId}/referrals`);
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
};

import { apiClient } from "@/services/apiClient";
import type {
    CompleteLinkedinRequest,
    CompleteLinkedinResponse,
    ConnectReferralRequest,
    ConnectReferralResponse,
    TaskResponse,
    TriggerWorkdayRequest,
    TriggerWorkdayResponse,
} from "@/types/api";

export const tasksService = {
    async triggerWorkday(payload: TriggerWorkdayRequest): Promise<TriggerWorkdayResponse> {
        const { data } = await apiClient.post<TriggerWorkdayResponse>("/tasks/workday/trigger", payload);
        return data;
    },
    async connectReferral(
        referralId: string,
        payload: ConnectReferralRequest
    ): Promise<ConnectReferralResponse> {
        const { data } = await apiClient.post<ConnectReferralResponse>(
            `/tasks/referrals/${referralId}/connect`,
            payload
        );
        return data;
    },
    async completeReferral(
        referralId: string,
        payload: CompleteLinkedinRequest
    ): Promise<CompleteLinkedinResponse> {
        const { data } = await apiClient.post<CompleteLinkedinResponse>(
            `/tasks/referrals/${referralId}/complete`,
            payload
        );
        return data;
    },
    async getStatus(taskId: string): Promise<TaskResponse> {
        const { data } = await apiClient.get<TaskResponse>(`/tasks/${taskId}`);
        return data;
    },
};

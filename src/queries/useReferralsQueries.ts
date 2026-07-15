import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referralsService } from "@/services/referralsService";
import { tasksService } from "@/services/tasksService";
import { queryKeys } from "@/queries/queryKeys";
import type { ConnectReferralRequest, CreateReferralsRequest, UpdateReferralRequest } from "@/types/api";

export function useJobReferrals(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobReferrals(jobId ?? ""),
    queryFn: () => referralsService.listByJob(jobId!),
    enabled: !!jobId,
  });
}

export function useCreateReferrals(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferralsRequest) => referralsService.createMany(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobReferrals(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

export function useGenerateReferrals(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => referralsService.generate(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobReferrals(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
    },
  });
}

export function useUpdateReferral(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referralId, payload }: { referralId: string; payload: UpdateReferralRequest }) =>
      referralsService.update(referralId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobReferrals(jobId) });
    },
  });
}

export function useDeleteReferral(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referralId: string) => referralsService.remove(referralId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobReferrals(jobId) });
    },
  });
}

export function useConnectReferral(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ referralId, payload }: { referralId: string; payload: ConnectReferralRequest }) =>
      tasksService.connectReferral(referralId, payload),
    onSuccess: () => {
      const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.jobReferrals(jobId) });
      // The agent processes the connection asynchronously and calls the backend back later,
      // so poll a couple of times to pick up the eventual status change without a full poller.
      invalidate();
      setTimeout(invalidate, 8_000);
      setTimeout(invalidate, 20_000);
    },
  });
}

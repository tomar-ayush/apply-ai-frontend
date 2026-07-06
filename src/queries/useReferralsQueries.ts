import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referralsService } from "@/services/referralsService";
import { queryKeys } from "@/queries/queryKeys";
import type { UpdateReferralRequest } from "@/types/api";

export function useJobReferrals(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobReferrals(jobId ?? ""),
    queryFn: () => referralsService.listByJob(jobId!),
    enabled: !!jobId,
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

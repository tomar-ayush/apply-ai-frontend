import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REFERRAL_STATUS_MAP } from "@/lib/statusMaps";
import { VALID_REFERRAL_TRANSITIONS, type ReferralStatus } from "@/types/enums";
import { useUpdateReferral } from "@/queries/useReferralsQueries";
import { getErrorMessage } from "@/lib/axios-error";

interface ReferralStatusSelectProps {
  jobId: string;
  referralId: string;
  status: ReferralStatus;
  linkedinUrl: string | null;
}

export function ReferralStatusSelect({ jobId, referralId, status, linkedinUrl }: ReferralStatusSelectProps) {
  const updateReferral = useUpdateReferral(jobId);
  const transitions = VALID_REFERRAL_TRANSITIONS[status] ?? [];

  const handleChange = (next: ReferralStatus) => {
    updateReferral.mutate(
      { referralId, payload: { status: next, linkedin_url: linkedinUrl ?? undefined } },
      {
        onSuccess: () => toast.success(`Marked as ${REFERRAL_STATUS_MAP[next].label}`),
        onError: (error) => toast.error(getErrorMessage(error, "Could not update referral status")),
      }
    );
  };

  if (transitions.length === 0) {
    return <StatusBadge kind="referral" status={status} />;
  }

  return (
    <Select value="" onValueChange={(v) => handleChange(v as ReferralStatus)}>
      <SelectTrigger size="sm" className="w-fit">
        <SelectValue placeholder={<StatusBadge kind="referral" status={status} />} />
      </SelectTrigger>
      <SelectContent>
        {transitions.map((next) => (
          <SelectItem key={next} value={next}>
            {REFERRAL_STATUS_MAP[next].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

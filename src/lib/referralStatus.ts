import { ReferralStatus } from "@/types/enums";

export function isValidReferralStatus(value: unknown): value is ReferralStatus {
  return typeof value === "string" && Object.values(ReferralStatus).includes(value as ReferralStatus);
}

export function assertValidReferralStatus(value: unknown, context = "Referral payload") {
  if (!isValidReferralStatus(value)) {
    throw new Error(`${context} received invalid referral status: ${String(value)}`);
  }
}

import { z } from "zod";
import { ReferralStatus } from "@/types/enums";

export const updateReferralSchema = z.object({
  status: z.enum([
    ReferralStatus.NOT_CONTACTED,
    ReferralStatus.REQUESTED,
    ReferralStatus.RESPONDED,
    ReferralStatus.REFERRED,
    ReferralStatus.DECLINED,
  ]),
  linkedin_url: z.string().url("Enter a valid LinkedIn URL").optional().or(z.literal("")),
  priority: z.number().int().min(0, "Priority must be at least 0").max(5, "Priority cannot be more than 5"),
});
export type UpdateReferralValues = z.infer<typeof updateReferralSchema>;

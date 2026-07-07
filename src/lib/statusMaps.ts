import { JobStatus, ReferralStatus, type JobStatus as JobStatusT, type ReferralStatus as ReferralStatusT } from "@/types/enums";

export interface StatusVisual {
  label: string;
  dotClassName: string;
  textClassName: string;
  bgClassName: string;
}

const COLOR_FAMILIES = {
  amber: { dotClassName: "bg-amber-500", textClassName: "text-amber-400", bgClassName: "bg-amber-500/10" },
  indigo: { dotClassName: "bg-indigo-500", textClassName: "text-indigo-400", bgClassName: "bg-indigo-500/10" },
  emerald: { dotClassName: "bg-emerald-500", textClassName: "text-emerald-400", bgClassName: "bg-emerald-500/10" },
  blue: { dotClassName: "bg-blue-500", textClassName: "text-blue-400", bgClassName: "bg-blue-500/10" },
  rose: { dotClassName: "bg-rose-500", textClassName: "text-rose-400", bgClassName: "bg-rose-500/10" },
  zinc: { dotClassName: "bg-zinc-500", textClassName: "text-zinc-400", bgClassName: "bg-zinc-500/10" },
} as const;

export const JOB_STATUS_MAP: Record<JobStatusT, StatusVisual> = {
  [JobStatus.NEW]: { label: "New", ...COLOR_FAMILIES.zinc },
  [JobStatus.JD_PARSED]: { label: "JD Parsed", ...COLOR_FAMILIES.zinc },
  [JobStatus.REFERRAL_IN_PROGRESS]: { label: "Referral In Progress", ...COLOR_FAMILIES.amber },
  [JobStatus.WAITING_FOR_REFERRAL]: { label: "Waiting Referral", ...COLOR_FAMILIES.amber },
  [JobStatus.REFERRAL_RECEIVED]: { label: "Referral Received", ...COLOR_FAMILIES.emerald },
  [JobStatus.RESUME_GENERATED]: { label: "Resume Ready", ...COLOR_FAMILIES.indigo },
  [JobStatus.READY_TO_APPLY]: { label: "Ready To Apply", ...COLOR_FAMILIES.indigo },
  [JobStatus.WORKDAY_RUNNING]: { label: "Applying…", ...COLOR_FAMILIES.blue },
  [JobStatus.APPLIED]: { label: "Applied", ...COLOR_FAMILIES.emerald },
  [JobStatus.OA]: { label: "Online Assessment", ...COLOR_FAMILIES.blue },
  [JobStatus.INTERVIEW]: { label: "Interviewing", ...COLOR_FAMILIES.blue },
  [JobStatus.OFFER]: { label: "Offer", ...COLOR_FAMILIES.emerald },
  [JobStatus.REJECTED]: { label: "Rejected", ...COLOR_FAMILIES.rose },
  [JobStatus.WITHDRAWN]: { label: "Withdrawn", ...COLOR_FAMILIES.zinc },
};

export const REFERRAL_STATUS_MAP: Record<ReferralStatusT, StatusVisual> = {
  [ReferralStatus.NOT_CONTACTED]: { label: "Not Contacted", ...COLOR_FAMILIES.zinc },
  [ReferralStatus.REQUESTED]: { label: "Requested", ...COLOR_FAMILIES.amber },
  [ReferralStatus.RESPONDED]: { label: "Responded", ...COLOR_FAMILIES.indigo },
  [ReferralStatus.REFERRED]: { label: "Referred", ...COLOR_FAMILIES.emerald },
  [ReferralStatus.DECLINED]: { label: "Declined", ...COLOR_FAMILIES.rose },
};


// Hand-mirrored from ../backend/app/{jobs,referrals,tasks}/models.py — keep in sync manually.

export const JobStatus = {
  NEW: "NEW",
  JD_PARSED: "JD_PARSED",
  REFERRAL_IN_PROGRESS: "REFERRAL_IN_PROGRESS",
  WAITING_FOR_REFERRAL: "WAITING_FOR_REFERRAL",
  REFERRAL_RECEIVED: "REFERRAL_RECEIVED",
  RESUME_GENERATED: "RESUME_GENERATED",
  READY_TO_APPLY: "READY_TO_APPLY",
  WORKDAY_RUNNING: "WORKDAY_RUNNING",
  APPLIED: "APPLIED",
  OA: "OA",
  INTERVIEW: "INTERVIEW",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const VALID_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  NEW: [JobStatus.JD_PARSED],
  JD_PARSED: [JobStatus.REFERRAL_IN_PROGRESS, JobStatus.RESUME_GENERATED],
  REFERRAL_IN_PROGRESS: [JobStatus.WAITING_FOR_REFERRAL],
  WAITING_FOR_REFERRAL: [JobStatus.REFERRAL_RECEIVED, JobStatus.RESUME_GENERATED],
  REFERRAL_RECEIVED: [JobStatus.RESUME_GENERATED],
  RESUME_GENERATED: [JobStatus.READY_TO_APPLY],
  READY_TO_APPLY: [JobStatus.WORKDAY_RUNNING],
  WORKDAY_RUNNING: [JobStatus.APPLIED],
  APPLIED: [JobStatus.OA, JobStatus.INTERVIEW, JobStatus.REJECTED],
  OA: [JobStatus.INTERVIEW, JobStatus.REJECTED],
  INTERVIEW: [JobStatus.OFFER, JobStatus.REJECTED],
  OFFER: [JobStatus.WITHDRAWN],
  REJECTED: [],
  WITHDRAWN: [],
};

export const TERMINAL_JOB_STATUSES: JobStatus[] = [JobStatus.REJECTED, JobStatus.WITHDRAWN];

export const ReferralStatus = {
  NOT_CONTACTED: "NOT_CONTACTED",
  REQUESTED: "REQUESTED",
  RESPONDED: "RESPONDED",
  REFERRED: "REFERRED",
  DECLINED: "DECLINED",
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const VALID_REFERRAL_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  NOT_CONTACTED: [ReferralStatus.REQUESTED],
  REQUESTED: [ReferralStatus.RESPONDED, ReferralStatus.DECLINED],
  RESPONDED: [ReferralStatus.REFERRED, ReferralStatus.DECLINED],
  REFERRED: [],
  DECLINED: [],
};

export const LLMProvider = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  OPENROUTER: "openrouter",
} as const;
export type LLMProvider = (typeof LLMProvider)[keyof typeof LLMProvider];

export const ResumeVersion = {
  ORIGINAL: "original",
  OPTIMIZED: "optimized",
} as const;
export type ResumeVersion = (typeof ResumeVersion)[keyof typeof ResumeVersion];

export const TaskType = {
  LINKEDIN_CONNECT: "LINKEDIN_CONNECT",
  WORKDAY_APPLY: "WORKDAY_APPLY",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const TaskStatus = {
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const ResumeSection = {
  PROFESSIONAL_SUMMARY: "professional_summary",
  SKILLS: "skills",
  WORK_EXPERIENCE: "work_experience",
  PROJECTS: "projects",
} as const;
export type ResumeSection = (typeof ResumeSection)[keyof typeof ResumeSection];

export const RESUME_SECTIONS: { value: ResumeSection; label: string }[] = [
  { value: ResumeSection.PROFESSIONAL_SUMMARY, label: "Professional Summary" },
  { value: ResumeSection.SKILLS, label: "Skills" },
  { value: ResumeSection.WORK_EXPERIENCE, label: "Work Experience" },
  { value: ResumeSection.PROJECTS, label: "Projects" },
];

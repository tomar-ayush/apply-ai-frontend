import type { JobStatus, ResumeVersion } from "@/types/enums";

export const queryKeys = {
  me: ["me"] as const,
  resumeOriginal: ["resume", "original"] as const,
  health: ["health"] as const,
  jobs: (status?: JobStatus) => ["jobs", { status }] as const,
  job: (id: string) => ["jobs", id] as const,
  jobJd: (id: string) => ["jobs", id, "jd"] as const,
  jobReferrals: (id: string) => ["jobs", id, "referrals"] as const,
  jobResume: (id: string, version: ResumeVersion) => ["jobs", id, "resume", version] as const,
  task: (id: string) => ["tasks", id] as const,
  activeTaskForJob: (jobId: string) => ["tasks", "byJob", jobId] as const,
};

import type { JobStatus, ResumeVersion } from "@/types/enums";

export const queryKeys = {
  me: ["me"] as const,
  // The original resume is a single global copy — key it by version only and share
  // one cache entry across every job page (no per-job refetch).
  resumeVersion: (version: ResumeVersion) => ["resume", version] as const,
  // The AI resume is generated per-job, so it stays job-scoped and refetches when
  // you switch jobs.
  jobResume: (id: string, version: ResumeVersion) => ["jobs", id, "resume", version] as const,
  jobs: (status?: JobStatus) => ["jobs", { status }] as const,
  job: (id: string) => ["jobs", id] as const,
  jobJd: (id: string) => ["jobs", id, "jd"] as const,
  jobReferrals: (id: string) => ["jobs", id, "referrals"] as const,
  task: (id: string) => ["tasks", id] as const,
};

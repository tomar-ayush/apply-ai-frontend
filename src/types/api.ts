// Hand-mirrored from ../backend/app/**/schemas.py — keep in sync manually, no codegen.

import type { JobStatus, ReferralStatus, ResumeVersion, TaskStatus, TaskType } from "@/types/enums";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;

  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  postal_code: string | null;

  current_company: string | null;
  current_title: string | null;
  years_of_experience: number | null;
  skills: Record<string, unknown> | null;
  education: Record<string, unknown> | null;

  llm_provider: string | null;
  has_llm_api_key: boolean;
  has_openrouter_key: boolean;
  has_openai_key: boolean;
  has_gemini_key: boolean;
  has_claude_key: boolean;
  current_llm_model: string | null;
  linkedin_message: string | null;
}

export interface UpdateLinkedinMessageRequest {
  linkedin_message: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  address?: string;
  postal_code?: string;
  current_company?: string;
  current_title?: string;
  years_of_experience?: number;
  skills?: Record<string, unknown>;
  education?: Record<string, unknown>;
  llm_provider?: string;
  llm_api_key?: string;
  current_llm_model?: string;
}

export interface PresignedUploadUrlResponse {
  latex_presigned_url: string;
}

export interface FinalizeResumeResponse {
  version: string;
  download_url: string | null;
  message: string;
}

export interface GenerateResumeResponse {
  download_url: string | null;
  validated: boolean;
}

export interface DownloadResumeResponse {
  version: string;
  download_url: string;
  message: string;
}

// Full job shape returned by GET /jobs (list) and POST /jobs — includes the
// denormalized company/role/workday_job_id fields.
export interface JobDetailResponse {
  id: string;
  user_id: string;
  company: string | null;
  role: string | null;
  workday_job_id: string | null;
  workday_url: string;
  status: JobStatus;
  referral_received: boolean;
  optimized_resume_pdf_url: string | null;
  optimized_resume_latex_url: string | null;
  created_at: string;
  updated_at: string;
}

// Detail-by-id shape returned by GET /jobs/{id} and PATCH /jobs/{id}/status.
// NOTE: company/role/workday_job_id are intentionally NOT returned here — source
// them from the jobs list (JobDetailResponse) or the JD instead.
export interface JobResponse {
  id: string;
  user_id: string;
  workday_url: string;
  status: JobStatus;
  referral_received: boolean;
  optimized_resume_pdf_url: string | null;
  optimized_resume_latex_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  items: JobDetailResponse[];
  total: number;
}

export interface JobJDResponse {
  id: string;
  job_id: string;
  company: string | null;
  role: string | null;
  workday_job_id: string | null;
  raw_text: string | null;
  skills: Record<string, unknown> | null;
  keywords: string[] | null;
  extracted_department: string[] | null;
  llm_summary: string | null;
  learning: Record<string, string[]> | null;
  created_at: string;
}

export interface UpdateJobJdRequest {
  company?: string | null;
  role?: string | null;
}

export interface ReferralResponse {
  id: string;
  job_id: string;
  name: string;
  linkedin_url: string | null;
  status: ReferralStatus;
  priority: number;
  asked_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface CreateReferralRequest {
  name: string;
  linkedin_url?: string | null;
  priority?: number;
}

export interface CreateReferralsRequest {
  referrals: CreateReferralRequest[];
}

export interface UpdateReferralRequest {
  status: ReferralStatus;
  linkedin_url?: string;
}

export interface ConnectReferralRequest {
  linkedin_url: string;
  message: string;
  task_id?: string;
}

export interface ConnectReferralResponse {
  queued: boolean;
  referral_id: string;
  task_id?: string;
  task_payload?: Record<string, unknown> | null;
}

export interface CompleteLinkedinRequest {
  state: string;
  task_id?: string | null;
  error?: string | null;
}

export interface CompleteLinkedinResponse {
  success: boolean;
  state: string;
}

export interface GenerateReferralsResponse {
  generated: number;
  referrals: ReferralResponse[];
}

export interface SelectResumeRequest {
  version: ResumeVersion;
}

export interface TriggerWorkdayRequest {
  job_id: string;
  job_url: string;
  resume_url: string;
  worker_url?: string;
}

export interface TriggerWorkdayResponse {
  queued: boolean;
  task_id: string;
}

export interface TaskResponse {
  id: string;
  job_id: string;
  user_id: string;
  task_type: TaskType;
  payload: Record<string, unknown>;
  status: TaskStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Hand-mirrored from ../backend/app/**/schemas.py — keep in sync manually, no codegen.

import type { JobStatus, ReferralStatus, TaskStatus, TaskType, ResumeVersion } from "@/types/enums";

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

  original_resume_pdf_url: string | null;
  original_resume_latex_url: string | null;

  llm_provider: string | null;
  has_llm_api_key: boolean;
  has_google_search_api_key: boolean;
  google_search_engine_id: string | null;

  created_at: string;
  updated_at: string;
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
  google_search_api_key?: string;
  google_search_engine_id?: string;
}

export interface ResumeUploadResponse {
  pdf_url: string | null;
  latex_url: string | null;
  message: string;
}

export interface JobResponse {
  id: string;
  user_id: string;
  company: string | null;
  role: string | null;
  workday_job_id: string | null;
  workday_url: string;
  status: JobStatus;
  optimized_resume_pdf_url: string | null;
  optimized_resume_latex_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  items: JobResponse[];
  total: number;
}

export interface JobJDResponse {
  id: string;
  job_id: string;
  raw_text: string | null;
  skills: Record<string, unknown> | null;
  keywords: string[] | null;
  team_signals: Record<string, unknown> | null;
  llm_summary: string | null;
  created_at: string;
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

export interface UpdateReferralRequest {
  status: ReferralStatus;
  linkedin_url?: string;
}

export interface GenerateReferralsResponse {
  generated: number;
  referrals: ReferralResponse[];
}

export interface GenerateResumeResponse {
  latex_url: string | null;
  pdf_url: string | null;
  message: string;
}

export interface ResumeResponse {
  version: string;
  pdf_url: string | null;
  latex_url: string | null;
}

export interface SelectResumeRequest {
  version: ResumeVersion;
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

export interface CreateTaskRequest {
  job_id: string;
  task_type: TaskType;
  payload?: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
}

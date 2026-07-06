import { isAxiosError } from "axios";

interface FastAPIValidationDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** Extracts a human-readable message from a FastAPI error response ({detail: string} or {detail: [...]}). */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return (detail as FastAPIValidationDetail[])
        .map((d) => d.msg)
        .filter(Boolean)
        .join(" ") || fallback;
    }
    if (error.message === "Network Error") return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}

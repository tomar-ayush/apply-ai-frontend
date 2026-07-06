import { formatDistanceToNowStrict, format } from "date-fns";

export function relativeTime(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export function shortDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

export function initials(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "?";
}

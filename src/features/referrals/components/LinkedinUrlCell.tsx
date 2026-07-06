import { useState } from "react";
import { toast } from "sonner";
import { Pencil, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUpdateReferral } from "@/queries/useReferralsQueries";
import { getErrorMessage } from "@/lib/axios-error";
import type { ReferralStatus } from "@/types/enums";

interface LinkedinUrlCellProps {
  jobId: string;
  referralId: string;
  status: ReferralStatus;
  linkedinUrl: string | null;
}

export function LinkedinUrlCell({ jobId, referralId, status, linkedinUrl }: LinkedinUrlCellProps) {
  const updateReferral = useUpdateReferral(jobId);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(linkedinUrl ?? "");

  const save = () => {
    setEditing(false);
    if (value === (linkedinUrl ?? "")) return;
    updateReferral.mutate(
      { referralId, payload: { status, linkedin_url: value || undefined } },
      { onError: (error) => toast.error(getErrorMessage(error, "Could not update LinkedIn URL")) }
    );
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={value}
        placeholder="https://linkedin.com/in/…"
        className="h-7 font-mono text-xs"
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      />
    );
  }

  if (!linkedinUrl) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-3" /> Add link
      </button>
    );
  }

  return (
    <div className="group flex items-center gap-1.5">
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-40 items-center gap-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="size-3 shrink-0" />
        <span className="truncate">{linkedinUrl.replace(/^https?:\/\//, "")}</span>
      </a>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Pencil className="size-3 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}

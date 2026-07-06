import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { initials, shortDate } from "@/lib/format";
import { useDeleteJob } from "@/queries/useJobsQueries";
import { toast } from "sonner";
import type { JobResponse } from "@/types/api";

export function JobHeader({ job }: { job: JobResponse }) {
  const navigate = useNavigate();
  const deleteJob = useDeleteJob();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    deleteJob.mutate(job.id, {
      onSuccess: () => {
        toast.success("Job deleted");
        navigate("/jobs", { replace: true });
      },
      onError: () => toast.error("Could not delete this job"),
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
          {initials(job.company || "?")}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-medium text-foreground">{job.role || "Untitled role"}</h2>
          <p className="text-sm text-muted-foreground">{job.company || "Unknown company"}</p>
          <a
            href={job.workday_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{job.workday_url}</span>
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            Added {shortDate(job.created_at)} · Updated {shortDate(job.updated_at)}
          </p>
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} className="shrink-0 text-muted-foreground hover:text-rose-400">
        <Trash2 className="size-4" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this job?"
        description="This permanently removes the job, its referrals, and generated resume from ApplyAI."
        confirmLabel="Delete job"
        destructive
        isPending={deleteJob.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

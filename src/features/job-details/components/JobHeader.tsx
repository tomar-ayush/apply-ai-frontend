import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { initials, shortDate } from "@/lib/format";
import { useDeleteJob } from "@/queries/useJobsQueries";
import { useUpdateJobJd } from "@/queries/useJobJdQueries";
import { toast } from "sonner";
import type { JobResponse } from "@/types/api";

interface JobHeaderProps {
  job: JobResponse;
  // GET /jobs/{id} omits these — pass them from the list cache or JD.
  company?: string | null;
  role?: string | null;
}

export function JobHeader({ job, company, role }: JobHeaderProps) {
  const navigate = useNavigate();
  const deleteJob = useDeleteJob();
  const updateJd = useUpdateJobJd(job.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company ?? "");
  const [roleDraft, setRoleDraft] = useState(role ?? "");

  useEffect(() => {
    setCompanyDraft(company ?? "");
    setRoleDraft(role ?? "");
  }, [company, role]);

  const isDirty = companyDraft !== (company ?? "") || roleDraft !== (role ?? "");

  const handleDelete = () => {
    deleteJob.mutate(job.id, {
      onSuccess: () => {
        toast.success("Job deleted");
        navigate("/jobs", { replace: true });
      },
      onError: () => toast.error("Could not delete this job"),
    });
  };

  const handleSave = () => {
    updateJd.mutate(
      { company: companyDraft || null, role: roleDraft || null },
      {
        onSuccess: (data) => {
          setCompanyDraft(data.company ?? "");
          setRoleDraft(data.role ?? "");
          setEditing(false);
          toast.success("Job details updated");
        },
        onError: () => toast.error("Could not update job details"),
      }
    );
  };

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
          {initials(companyDraft || "?")}
        </span>
        <div className="min-w-0 space-y-1.5">
          {editing ? (
            <div className="space-y-1.5">
              <Input
                value={roleDraft}
                onChange={(e) => setRoleDraft(e.target.value)}
                placeholder="Role title"
                className="h-7 text-base font-medium"
              />
              <Input
                value={companyDraft}
                onChange={(e) => setCompanyDraft(e.target.value)}
                placeholder="Company"
                className="h-7 text-sm"
              />
            </div>
          ) : (
            <>
              <h2 className="truncate text-base font-medium text-foreground">{role || "Untitled role"}</h2>
              <p className="text-sm text-muted-foreground">{company || "Unknown company"}</p>
            </>
          )}
          <a
            href={job.workday_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3 shrink-0" />
            <span className="truncate">{job.workday_url}</span>
          </a>
          <p className="text-xs text-muted-foreground">
            Added {shortDate(job.created_at)} · Updated {shortDate(job.updated_at)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {editing ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setCompanyDraft(company ?? ""); setRoleDraft(role ?? ""); }} disabled={updateJd.isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty || updateJd.isPending}>
              <Check className="size-3.5" />
              {updateJd.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} className="text-muted-foreground hover:text-rose-400">
          <Trash2 className="size-4" />
        </Button>
      </div>

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

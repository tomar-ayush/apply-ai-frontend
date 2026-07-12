import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CircleCheck, Link as LinkIcon, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { ExtractionProgress } from "@/features/jobs/components/ExtractionProgress";
import { ExtractionSummary } from "@/features/jobs/components/ExtractionSummary";
import { addJobSchema, type AddJobValues } from "@/features/jobs/schemas";
import { useCreateJob } from "@/queries/useJobsQueries";
import { useJobJd, useUpdateJobJd } from "@/queries/useJobJdQueries";
import { getErrorMessage } from "@/lib/axios-error";
import type { JobDetailResponse } from "@/types/api";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddJobDialog({ open, onOpenChange }: AddJobDialogProps) {
  const navigate = useNavigate();
  const createJob = useCreateJob();
  const [createdJob, setCreatedJob] = useState<JobDetailResponse | null>(null);
  const jdQuery = useJobJd(createdJob ?? undefined);
  const updateJd = useUpdateJobJd(createdJob?.id ?? "");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const form = useForm<AddJobValues>({ resolver: zodResolver(addJobSchema), defaultValues: { workday_url: "" } });

  useEffect(() => {
    if (!open) {
      setCreatedJob(null);
      form.reset();
      createJob.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Seed editable fields from the parsed job once it's created.
  useEffect(() => {
    if (createdJob) {
      setCompany(createdJob.company ?? "");
      setRole(createdJob.role ?? "");
    }
  }, [createdJob]);

  const isDirty =
    !!createdJob && (company !== (createdJob.company ?? "") || role !== (createdJob.role ?? ""));

  const onSubmit = (ai: boolean) =>
    form.handleSubmit((values) => {
      createJob.mutate(
        { workdayUrl: values.workday_url, ai },
        { onSuccess: (job) => setCreatedJob(job) }
      );
    })();

  const handleAddAnother = () => {
    setCreatedJob(null);
    form.reset();
    createJob.reset();
  };

  const handleViewJob = () => {
    if (!createdJob) return;
    onOpenChange(false);
    navigate(`/jobs/${createdJob.id}`);
  };

  const handleUpdateJob = () => {
    if (!createdJob) return;
    updateJd.mutate(
      { company: company || null, role: role || null },
      {
        onSuccess: (data) => {
          setCreatedJob({ ...createdJob, company: data.company, role: data.role });
          setCompany(data.company ?? "");
          setRole(data.role ?? "");
          onOpenChange(false);
          navigate(`/jobs/${createdJob.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md border border-border">
              <LinkIcon className="size-3.5 text-muted-foreground" />
            </div>
            <DialogTitle>Add a job</DialogTitle>
          </div>
          <DialogDescription>Paste any Workday job listing URL to automatically parse details using AI.</DialogDescription>
        </DialogHeader>

        {!createdJob ? (
          <form className="space-y-3">
            <Field>
              <FieldLabel htmlFor="workday_url">Workday job listing URL</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    id="workday_url"
                    placeholder="https://wd5.myworkdayjobs.com/en-US/Company/job/..."
                    className="font-mono text-xs"
                    disabled={createJob.isPending}
                    aria-invalid={!!form.formState.errors.workday_url}
                    {...form.register("workday_url")}
                  />
                  <Button
                    type="button"
                    disabled={createJob.isPending}
                    className="shrink-0"
                    onClick={() => onSubmit(true)}
                  >
                    <Sparkles className="size-4" />
                    {createJob.isPending ? "Extracting…" : "AI Parse"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createJob.isPending}
                    className="shrink-0"
                    onClick={() => onSubmit(false)}
                  >
                    {createJob.isPending ? "Extracting…" : "Normal Parse"}
                  </Button>
                </div>
                <FieldError errors={[form.formState.errors.workday_url]} />
              </FieldContent>
            </Field>

            <ExtractionProgress active={createJob.isPending} />

            {createJob.isError && (
              <ErrorBanner message={getErrorMessage(createJob.error, "Could not extract this job listing.")} />
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              <CircleCheck className="size-4 shrink-0" />
              Job added successfully.
            </div>
            <ExtractionSummary
              jd={jdQuery.data}
              isJdLoading={jdQuery.isLoading}
              company={company}
              role={role}
              onCompanyChange={setCompany}
              onRoleChange={setRole}
            />
          </div>
        )}

        {createdJob && (
          <DialogFooter>
            <Button variant="ghost" onClick={handleAddAnother}>
              Add another
            </Button>
            {isDirty ? (
              <Button onClick={handleUpdateJob} disabled={updateJd.isPending}>
                {updateJd.isPending ? "Updating…" : "Update Job"}
              </Button>
            ) : (
              <Button onClick={handleViewJob}>View Job</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

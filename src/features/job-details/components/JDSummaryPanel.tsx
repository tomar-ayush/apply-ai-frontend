import { toast } from "sonner";
import { RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useReparseJd } from "@/queries/useJobJdQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { JobStatus } from "@/types/enums";
import type { JobJDResponse } from "@/types/api";

interface JDSummaryPanelProps {
  jobId: string;
  jobStatus: JobStatus;
  jd: JobJDResponse | undefined;
  isLoading: boolean;
}

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function JDSummaryPanel({ jobId, jobStatus, jd, isLoading }: JDSummaryPanelProps) {
  const reparse = useReparseJd(jobId);

  const handleReparse = () => {
    reparse.mutate(undefined, {
      onSuccess: () => toast.success("Job description re-parsed"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not re-parse this job description")),
    });
  };

  const skills = (jd?.skills?.required as string[] | undefined) ?? [];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Job Description</p>
        <Button size="sm" variant="outline" onClick={handleReparse} disabled={reparse.isPending || jobStatus === JobStatus.NEW}>
          <RefreshCw className={reparse.isPending ? "size-3.5 animate-spin" : "size-3.5"} />
          Re-parse JD
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : jobStatus === JobStatus.NEW || !jd ? (
          <EmptyState
            icon={FileText}
            title="Not parsed yet"
            description="This job hasn't been parsed by the AI agent yet."
            className="py-8"
          />
        ) : (
          <>
            <p className="text-sm leading-relaxed text-foreground/90">
              {jd.llm_summary || "No summary was returned for this listing."}
            </p>
            <TagGroup title="Keywords" tags={jd.keywords ?? []} />
            <TagGroup title="Required skills" tags={skills} />
          </>
        )}
      </div>
    </div>
  );
}

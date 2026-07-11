import { Loader2 } from "lucide-react";
import type { JobDetailResponse, JobJDResponse } from "@/types/api";

interface ExtractionSummaryProps {
  job: JobDetailResponse;
  jd: JobJDResponse | undefined;
  isJdLoading: boolean;
}

export function ExtractionSummary({ job, jd, isJdLoading }: ExtractionSummaryProps) {
  return (
    <div className="space-y-4 border-t border-border pt-4">
      <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Extraction output summary</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Parsed company</p>
          <p className="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-sm text-foreground">
            {job.company || "—"}
          </p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Parsed role title</p>
          <p className="rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-sm text-foreground">
            {job.role || "—"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">AI JD summary</p>
        {isJdLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Summarizing job description…
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-sm leading-relaxed text-foreground">
            {jd?.llm_summary || "No summary available yet."}
          </p>
        )}
      </div>

      {!!jd?.keywords?.length && (
        <div>
          <p className="mb-1.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Extracted keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {jd.keywords.slice(0, 12).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

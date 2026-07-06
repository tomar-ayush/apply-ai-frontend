import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFComparisonPanel } from "@/components/shared/PDFComparisonPanel";
import { useJobResume, useGenerateResume, useSelectResumeVersion } from "@/queries/useResumeQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { ResumeVersion } from "@/types/enums";

export function ResumeSection({ jobId }: { jobId: string }) {
  const originalQuery = useJobResume(jobId, ResumeVersion.ORIGINAL);
  const optimizedQuery = useJobResume(jobId, ResumeVersion.OPTIMIZED);
  const generateResume = useGenerateResume(jobId);
  const selectVersion = useSelectResumeVersion(jobId);
  const [selected, setSelected] = useState<ResumeVersion | undefined>(undefined);

  const handleGenerate = () => {
    generateResume.mutate(undefined, {
      onSuccess: () => toast.success("Optimized resume generated"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not generate an optimized resume")),
    });
  };

  const handleSelect = (version: ResumeVersion) => {
    setSelected(version);
    selectVersion.mutate(version, {
      onSuccess: () => toast.success(`Using ${version} resume`),
      onError: (error) => toast.error(getErrorMessage(error, "Could not select this resume version")),
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Resume</p>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generateResume.isPending}>
          <Sparkles className="size-3.5" />
          {generateResume.isPending ? "Optimizing…" : "Generate Optimized Resume"}
        </Button>
      </div>
      <div className="p-4">
        <PDFComparisonPanel
          originalUrl={originalQuery.data?.pdf_url}
          optimizedUrl={optimizedQuery.data?.pdf_url}
          isOriginalLoading={originalQuery.isLoading}
          isOptimizedLoading={optimizedQuery.isLoading || generateResume.isPending}
          selectedVersion={selected}
          isSelecting={selectVersion.isPending}
          onSelectVersion={handleSelect}
        />
      </div>
    </div>
  );
}

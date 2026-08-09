import { useState } from "react";
import { toast } from "sonner";
import { FileUp, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PDFComparisonPanel } from "@/components/shared/PDFComparisonPanel";
import { LatexUploadDialog } from "@/features/job-details/components/LatexUploadDialog";
import { GenerateResumeDialog } from "@/features/job-details/components/GenerateResumeDialog";
import { PDFDiffViewer } from "@/features/job-details/components/PDFDiffViewer";
import { useJobResume, useGenerateResume, useCompileJobResume, useJobResumeLatex } from "@/queries/useResumeQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { ResumeVersion, type ResumeSection as ResumeSectionValue } from "@/types/enums";

export function ResumeSection({ jobId }: { jobId: string }) {
  const originalQuery = useJobResume(jobId, ResumeVersion.ORIGINAL);
  const optimizedQuery = useJobResume(jobId, ResumeVersion.OPTIMIZED);
  const aiLatexQuery = useJobResumeLatex(jobId, ResumeVersion.OPTIMIZED);
  const origLatexQuery = useJobResumeLatex(jobId, ResumeVersion.ORIGINAL);
  const generateResume = useGenerateResume(jobId);
  const compileJobResume = useCompileJobResume(jobId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const latexSource = aiLatexQuery.data || origLatexQuery.data || "";

  const handleGenerateConfirm = (sections: ResumeSectionValue[]) => {
    setGenerateOpen(false);
    toast.info("Generating optimized resume in background…");
    generateResume.mutate(sections, {
      onSuccess: () => {
        toast.success("Optimized resume generated");
      },
      onError: (error) => toast.error(getErrorMessage(error, "Could not generate an optimized resume")),
    });
  };

  const handleRecompile = (latexText?: string) => {
    if (!latexText || !latexText.trim()) {
      toast.error("No LaTeX content to compile");
      return;
    }
    toast.info("Compiling & updating job optimized resume…");
    compileJobResume.mutate(latexText, {
      onSuccess: () => toast.success("Optimized resume compiled & updated successfully!"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not compile optimized resume")),
    });
  };

  const handleRefetch = () => {
    Promise.all([originalQuery.refetch(), optimizedQuery.refetch(), aiLatexQuery.refetch(), origLatexQuery.refetch()])
      .then(() => toast.success("Resume PDFs and LaTeX refetched"))
      .catch((e) => toast.error(getErrorMessage(e, "Could not refetch resumes")));
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground hidden sm:block">Resume</p>
        <div className="flex flex-1 justify-end gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefetch}
            disabled={originalQuery.isFetching || optimizedQuery.isFetching}
            title="Refetch resume PDFs"
            className="px-2 sm:px-3"
          >
            <RefreshCw className={cn("size-3.5 sm:mr-1.5", (originalQuery.isFetching || optimizedQuery.isFetching) && "animate-spin")} />
            <span className="hidden sm:inline">Refetch</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} className="px-2 sm:px-3">
            <FileUp className="size-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Upload LaTeX</span>
            <span className="inline sm:hidden ml-1.5">Upload</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateOpen(true)} disabled={generateResume.isPending} className="px-2 sm:px-3">
            <Sparkles className="size-3.5 sm:mr-1.5" />
            <span className="hidden lg:inline">{generateResume.isPending ? "Optimizing…" : "Generate Optimized Resume"}</span>
            <span className="inline lg:hidden ml-1.5">{generateResume.isPending ? "Optimizing…" : "Generate"}</span>
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-6">
        <PDFComparisonPanel
          originalUrl={originalQuery.data?.download_url}
          optimizedUrl={optimizedQuery.data?.download_url}
          originalMessage={originalQuery.data?.message}
          optimizedMessage={optimizedQuery.data?.message}
          isOriginalLoading={originalQuery.isLoading}
          isOptimizedLoading={optimizedQuery.isLoading || generateResume.isPending || compileJobResume.isPending}
        />

        <PDFDiffViewer
          originalUrl={originalQuery.data?.download_url}
          optimizedUrl={optimizedQuery.data?.download_url}
          latexSource={latexSource}
          isLoading={optimizedQuery.isLoading || generateResume.isPending || compileJobResume.isPending}
          onRecompile={handleRecompile}
          isRecompiling={generateResume.isPending || compileJobResume.isPending}
        />
      </div>

      <LatexUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <GenerateResumeDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onConfirm={handleGenerateConfirm}
        isPending={generateResume.isPending}
      />
    </div>
  );
}

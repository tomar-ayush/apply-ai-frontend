import { useRef } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { PDFViewer } from "@/components/shared/PDFComparisonPanel";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useOriginalResume, useUploadResume } from "@/queries/useUsersQueries";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getErrorMessage } from "@/lib/axios-error";

export function ResumeManagerSection() {
  const resumeQuery = useOriginalResume();
  const uploadResume = useUploadResume();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const latexInputRef = useRef<HTMLInputElement>(null);
  const [defaultForAutomation, setDefaultForAutomation] = useLocalStorage("applyai_resume_default_automation", true);

  const handleFilesSelected = (pdfFile: File | null, latexFile: File | null) => {
    if (!pdfFile && !latexFile) return;
    const formData = new FormData();
    if (pdfFile) formData.append("pdf_file", pdfFile);
    if (latexFile) formData.append("latex_file", latexFile);
    uploadResume.mutate(formData, {
      onSuccess: () => toast.success("Resume uploaded"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not upload resume")),
    });
  };

  const hasResume = !!resumeQuery.data?.pdf_url;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="02"
        title="Resume Manager"
        description="Manage your source resume here. Job-specific optimization lives only inside each Job Details workspace."
        actions={<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">Single source of truth</span>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Original Resume</p>
            {hasResume && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">Uploaded</span>
            )}
          </div>
          <PDFViewer url={resumeQuery.data?.pdf_url} isLoading={resumeQuery.isLoading} emptyLabel="No resume uploaded yet." />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Resume Metadata</p>

          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="default-automation" className="font-normal text-muted-foreground">
              Default for automation
            </Label>
            <Switch id="default-automation" checked={defaultForAutomation} onCheckedChange={setDefaultForAutomation} size="sm" />
          </div>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files?.[0] ?? null, null)}
          />
          <input
            ref={latexInputRef}
            type="file"
            accept=".tex"
            className="hidden"
            onChange={(e) => handleFilesSelected(null, e.target.files?.[0] ?? null)}
          />

          <Button size="sm" className="w-full" disabled={uploadResume.isPending} onClick={() => pdfInputRef.current?.click()}>
            <Upload className="size-3.5" />
            {hasResume ? "Replace PDF" : "Upload PDF"}
          </Button>
          <Button size="sm" variant="outline" className="w-full" disabled={uploadResume.isPending} onClick={() => latexInputRef.current?.click()}>
            <Upload className="size-3.5" />
            Upload LaTeX Source
          </Button>
          {hasResume && (
            <a
              href={resumeQuery.data?.pdf_url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
            >
              <Download className="size-3.5" />
              Download Resume
            </a>
          )}
          <p className="text-xs text-muted-foreground">
            A LaTeX source is required before ApplyAI can generate job-specific optimized resumes.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ClipboardPaste, Download, FileUp, Loader2, RefreshCw } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { PDFViewer } from "@/components/shared/PDFComparisonPanel";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOriginalResume } from "@/queries/useUsersQueries";
import { useRefreshResumeDownload, useUploadLatex } from "@/queries/useResumeQueries";
import { ResumeVersion } from "@/types/enums";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getErrorMessage } from "@/lib/axios-error";

const SAMPLE_LATEX = `\\documentclass{article}
\\begin{document}
Hello, \\LaTeX!
\\end{document}`;

export function ResumeManagerSection() {
  const resumeQuery = useOriginalResume();
  const uploadLatex = useUploadLatex();
  const refreshDownload = useRefreshResumeDownload(ResumeVersion.ORIGINAL);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [defaultForAutomation, setDefaultForAutomation] = useLocalStorage("applyai_resume_default_automation", true);

  const hasResume = !!resumeQuery.data?.download_url;

  const handleFile = async (file: File) => {
    const text = await file.text();
    uploadLatex.mutate(text, {
      onSuccess: () => toast.success("LaTeX uploaded and compiling to PDF"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not upload resume")),
    });
  };

  const handlePasteSubmit = () => {
    if (!pasted.trim()) {
      toast.error("Paste your LaTeX source first.");
      return;
    }
    uploadLatex.mutate(pasted, {
      onSuccess: () => {
        toast.success("LaTeX uploaded and compiling to PDF");
        setPasted("");
        setPasteOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error, "Could not upload resume")),
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="02"
        title="Resume Manager"
        description="Manage your source resume here. Job-specific optimization lives only inside each Job Details workspace."
        actions={<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">Single source of truth</span>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Original Resume</p>
            <div className="flex items-center gap-2">
              {hasResume && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">Uploaded</span>
              )}
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => refreshDownload.mutate(undefined, {
                  onSuccess: () => toast.success("Resume refreshed"),
                  onError: (error) => toast.error(getErrorMessage(error, "Could not refresh resume")),
                })}
                disabled={refreshDownload.isPending || resumeQuery.isLoading}
                title="Refresh from storage"
              >
                <RefreshCw className={cn("size-3.5", (refreshDownload.isPending || resumeQuery.isFetching) && "animate-spin")} />
              </Button>
            </div>
          </div>
          <PDFViewer url={resumeQuery.data?.download_url} isLoading={resumeQuery.isLoading} emptyLabel="No resume uploaded yet." />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Resume Source (LaTeX only)</p>

          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="default-automation" className="font-normal text-muted-foreground">
              Default for automation
            </Label>
            <Switch id="default-automation" checked={defaultForAutomation} onCheckedChange={setDefaultForAutomation} size="sm" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".tex,text/x-tex"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />

          <Button size="sm" className="w-full" disabled={uploadLatex.isPending} onClick={() => fileInputRef.current?.click()}>
            {uploadLatex.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
            {hasResume ? "Replace LaTeX file" : "Upload LaTeX file"}
          </Button>
          <Button size="sm" variant="outline" className="w-full" disabled={uploadLatex.isPending} onClick={() => setPasteOpen(true)}>
            <ClipboardPaste className="size-3.5" />
            Paste LaTeX code
          </Button>

          {hasResume && (
            <a
              href={resumeQuery.data?.download_url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
            >
              <Download className="size-3.5" />
              Download Resume
            </a>
          )}
          <p className="text-xs text-muted-foreground">
            A LaTeX source is required before ApplyAI can generate job-specific optimized resumes. We compile it to PDF for you.
          </p>
        </div>
      </div>

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Paste LaTeX code</DialogTitle>
            <DialogDescription>Paste your resume LaTeX source below. It will be compiled to a PDF.</DialogDescription>
          </DialogHeader>

          <Textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste your LaTeX source here…"
            rows={12}
            className="max-h-80 overflow-y-auto font-mono text-xs"
            autoFocus
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button variant="ghost" onClick={() => setPasted(SAMPLE_LATEX)}>
              Load sample
            </Button>
            <Button onClick={handlePasteSubmit} disabled={uploadLatex.isPending}>
              {uploadLatex.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <ClipboardPaste className="size-3.5" />}
              Upload & Compile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

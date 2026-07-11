import { useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, FileX2, Loader2, Maximize2, X } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdf-worker";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeVersion } from "@/types/enums";

interface PDFViewerProps {
  url: string | null | undefined;
  isLoading?: boolean;
  emptyLabel: string;
  onExpand?: () => void;
}

export function PDFViewer({ url, isLoading, emptyLabel, onExpand }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <FileX2 className="size-6" />
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="max-h-96 w-full overflow-auto rounded-lg bg-muted/30 py-3">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          }
          error={
            <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
              Couldn't render this PDF.
            </div>
          }
          className="flex justify-center"
        >
          <div
            className="inline-block cursor-zoom-in"
            onClick={() => onExpand?.()}
          >
            <Page pageNumber={page} width={320} renderAnnotationLayer={false} />
          </div>
        </Document>
      </div>
      {!!numPages && numPages > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button variant="ghost" size="icon-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="font-mono tabular-nums">
            {page} / {numPages}
          </span>
          <Button variant="ghost" size="icon-xs" disabled={page >= numPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface PDFComparisonPanelProps {
  originalUrl?: string | null;
  optimizedUrl?: string | null;
  isOriginalLoading?: boolean;
  isOptimizedLoading?: boolean;
  onSelectVersion?: (version: ResumeVersion) => void;
  selectedVersion?: ResumeVersion;
  isSelecting?: boolean;
}

export function PDFComparisonPanel({
  originalUrl,
  optimizedUrl,
  isOriginalLoading,
  isOptimizedLoading,
  onSelectVersion,
  selectedVersion,
  isSelecting,
}: PDFComparisonPanelProps) {
  const panels: { version: ResumeVersion; label: string; url: string | null | undefined; isLoading?: boolean }[] = [
    { version: "original" as ResumeVersion, label: "Original", url: originalUrl, isLoading: isOriginalLoading },
    { version: "optimized" as ResumeVersion, label: "Optimized", url: optimizedUrl, isLoading: isOptimizedLoading },
  ];

  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {panels.map((panel) => (
        <div key={panel.version} className={cn("rounded-lg border border-border p-3", selectedVersion === panel.version && "border-primary/50 ring-1 ring-primary/20")}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{panel.label}</p>
            <div className="flex items-center gap-2">
              {panel.url && (
                <Button size="xs" variant="ghost" onClick={() => setExpandedUrl(panel.url ?? null)} title="Expand">
                  <Maximize2 className="size-3.5" />
                </Button>
              )}
              {onSelectVersion && panel.url && (
                <Button
                  size="xs"
                  variant={selectedVersion === panel.version ? "secondary" : "outline"}
                  disabled={isSelecting}
                  onClick={() => onSelectVersion(panel.version)}
                >
                  {selectedVersion === panel.version ? "Selected" : "Use this version"}
                </Button>
              )}
            </div>
          </div>
          <PDFViewer
            url={panel.url}
            isLoading={panel.isLoading}
            onExpand={panel.url ? () => setExpandedUrl(panel.url ?? null) : undefined}
            emptyLabel={panel.version === "original" ? "No original resume uploaded yet." : "No optimized resume generated yet."}
          />
        </div>
      ))}

      {expandedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExpandedUrl(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-xl border border-border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Resume (expanded)</p>
              <Button variant="ghost" size="icon" onClick={() => setExpandedUrl(null)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Document
                file={expandedUrl}
                loading={
                  <div className="flex h-80 items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                }
                error={
                  <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                    Couldn't render this PDF.
                  </div>
                }
                className="flex justify-center"
              >
                <Page pageNumber={1} width={700} renderAnnotationLayer={false} />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

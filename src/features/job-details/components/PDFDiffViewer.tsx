import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, Expand, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdf-worker";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { buildRasterDiff, type DiffPage } from "@/lib/pdfRasterDiff";

interface PDFDiffViewerProps {
  originalUrl?: string | null;
  optimizedUrl?: string | null;
  isLoading?: boolean;
}

export function PDFDiffViewer({ originalUrl, optimizedUrl, isLoading }: PDFDiffViewerProps) {
  const [pages, setPages] = useState<DiffPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!originalUrl || !optimizedUrl) {
      setPages([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setComputing(true);
    setError(null);
    setPage(1);
    buildRasterDiff(originalUrl, optimizedUrl)
      .then((res) => {
        if (cancelled) return;
        if (res.error) setError(res.error);
        else setPages(res.pages);
      })
      .finally(() => {
        if (!cancelled) setComputing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [originalUrl, optimizedUrl]);

  const showLoading = isLoading || computing;
  const current = pages[page - 1];
  const numPages = pages.length;

  // The PDF page and the diff overlay live in the same `relative` wrapper so the
  // overlay is guaranteed to sit exactly on top of the page at any width.
  const renderStage = (width: number) => (
    <div
      className="relative inline-block cursor-zoom-in"
      onClick={() => {
        if (!expanded) setExpanded(true);
      }}
    >
      <Document file={optimizedUrl} loading={null} error={null}>
        <Page pageNumber={page} width={width} renderAnnotationLayer={false} />
      </Document>
      {current && (
        <img
          src={current.overlayUrl}
          alt="resume diff overlay"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );

  const viewer = (
    <div className="flex flex-col items-center gap-2">
      <div className="max-h-[28rem] w-full overflow-auto rounded-lg bg-muted/30 py-3">
        {current ? (
          <div className="flex justify-center">{renderStage(expanded ? 700 : 340)}</div>
        ) : (
          <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
            {showLoading ? <Loader2 className="size-4 animate-spin" /> : "No diff"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button variant="ghost" size="icon-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="font-mono tabular-nums">
          {page} / {numPages || 1}
        </span>
        <Button variant="ghost" size="icon-xs" disabled={page >= numPages} onClick={() => setPage((p) => p + 1)}>
          <ChevronRight className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setExpanded((e) => !e)} title="Expand">
          {expanded ? <Minimize2 className="size-3.5" /> : <Expand className="size-3.5" />}
        </Button>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm bg-emerald-500" /> Added
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm bg-rose-500" /> Removed
        </span>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Resume Changes</p>
        <Button variant="outline" size="sm" onClick={() => setExpanded(true)} disabled={!numPages}>
          <Maximize2 className="size-3.5" />
          Expand
        </Button>
      </div>

      <div className="p-4">
        {error ? (
          <EmptyState icon={X} title="Comparison unavailable" description={error} className="py-8" />
        ) : (
          viewer
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-xl border border-border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Resume Diff (expanded)</p>
              <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {viewer}
          </div>
        </div>
      )}
    </div>
  );
}

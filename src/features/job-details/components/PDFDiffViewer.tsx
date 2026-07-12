import { useEffect, useMemo, useState } from "react";
import { diffWords, type Change } from "diff";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { extractTextFromPdfUrl, type PdfTextDocument } from "@/lib/pdfText";
import "@/features/job-details/components/PDFDiffViewer.css";

type ViewMode = "side-by-side" | "unified" | "additions" | "removals" | "changes-only";

interface PDFDiffViewerProps {
  originalUrl?: string | null;
  optimizedUrl?: string | null;
  isLoading?: boolean;
}

interface PageDiff {
  pageNumber: number;
  parts: Change[];
  originalText: string;
  modifiedText: string;
  additions: number;
  deletions: number;
  unchanged: number;
}

function computeStats(parts: Change[]) {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const part of parts) {
    const words = part.value.trim().split(/\s+/).filter((w) => w.length > 0).length;
    if (part.added) additions += words;
    else if (part.removed) deletions += words;
    else unchanged += words;
  }
  const totalChanges = additions + deletions;
  const totalWords = additions + deletions + unchanged;
  const changePercentage = totalWords > 0 ? (totalChanges / totalWords) * 100 : 0;
  return { additions, deletions, unchanged, totalChanges, changePercentage };
}

export function PDFDiffViewer({ originalUrl, optimizedUrl, isLoading }: PDFDiffViewerProps) {
  const [pages, setPages] = useState<PageDiff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<ViewMode>("side-by-side");
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
    Promise.all([extractTextFromPdfUrl(originalUrl), extractTextFromPdfUrl(optimizedUrl)])
      .then(([orig, opt]: [PdfTextDocument, PdfTextDocument]) => {
        if (cancelled) return;
        const maxPages = Math.max(orig.totalPages, opt.totalPages);
        const diffs: PageDiff[] = [];
        for (let i = 0; i < maxPages; i++) {
          const originalText = orig.pages[i]?.text ?? "";
          const modifiedText = opt.pages[i]?.text ?? "";
          const parts = diffWords(originalText, modifiedText);
          const stats = computeStats(parts);
          diffs.push({
            pageNumber: i + 1,
            parts,
            originalText,
            modifiedText,
            ...stats,
          });
        }
        setPages(diffs);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not diff PDFs");
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
  const totalStats = useMemo(() => {
    const acc = pages.reduce(
      (a, p) => ({
        additions: a.additions + p.additions,
        deletions: a.deletions + p.deletions,
        unchanged: a.unchanged + p.unchanged,
      }),
      { additions: 0, deletions: 0, unchanged: 0 }
    );
    const total = acc.additions + acc.deletions + acc.unchanged;
    return {
      ...acc,
      additionPercent: total > 0 ? (acc.additions / total) * 100 : 0,
      deletionPercent: total > 0 ? (acc.deletions / total) * 100 : 0,
    };
  }, [pages]);

  const viewer = (
    <div className="flex flex-col gap-3">
      {numPages > 0 && (
        <div className="diff-stats">
          <div className="stat-item additions">
            <div className="stat-icon">+</div>
            <div className="stat-info">
              <span className="stat-value">{totalStats.additions}</span>
              <span className="stat-label">words added</span>
            </div>
          </div>
          <div className="stat-item removals">
            <div className="stat-icon">−</div>
            <div className="stat-info">
              <span className="stat-value">{totalStats.deletions}</span>
              <span className="stat-label">words removed</span>
            </div>
          </div>
          <div className="stat-item unchanged">
            <div className="stat-icon">=</div>
            <div className="stat-info">
              <span className="stat-value">{totalStats.unchanged}</span>
              <span className="stat-label">words unchanged</span>
            </div>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-segment additions" style={{ width: `${totalStats.additionPercent}%` }} />
            <div className="stat-bar-segment removals" style={{ width: `${totalStats.deletionPercent}%` }} />
          </div>
        </div>
      )}

      {numPages > 0 && (
        <div className="view-mode-tabs">
          {(
            [
              { mode: "side-by-side", label: "Side by Side" },
              { mode: "unified", label: "Unified" },
              { mode: "additions", label: "Additions" },
              { mode: "removals", label: "Removals" },
              { mode: "changes-only", label: "Changes Only" },
            ] as { mode: ViewMode; label: string }[]
          ).map((t) => (
            <button
              key={t.mode}
              className={`view-mode-tab ${mode === t.mode ? "active" : ""}`}
              onClick={() => setMode(t.mode)}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {current ? (
        <div className="diff-view-wrap">
          <DiffView parts={current.parts} mode={mode} originalText={current.originalText} modifiedText={current.modifiedText} />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          {showLoading ? <Loader2 className="size-4 animate-spin" /> : "No diff"}
        </div>
      )}

      <div className="flex items-center justify-between">
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
        </div>
        <Button variant="ghost" size="icon-xs" onClick={() => setExpanded((e) => !e)} title="Expand">
          {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </Button>
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

function DiffView({
  parts,
  mode,
  originalText,
  modifiedText,
}: {
  parts: Change[];
  mode: ViewMode;
  originalText?: string;
  modifiedText?: string;
}) {
  if (mode === "side-by-side" && originalText !== undefined && modifiedText !== undefined) {
    return (
      <div className="diff-view side-by-side">
        <div className="diff-panel original">
          <h4 className="panel-header">Original</h4>
          <div className="diff-content">
            {parts.map((part, index) => {
              if (part.added) return null;
              return (
                <span key={index} className={part.removed ? "diff-removed" : ""}>
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
        <div className="diff-panel modified">
          <h4 className="panel-header">Optimized</h4>
          <div className="diff-content">
            {parts.map((part, index) => {
              if (part.removed) return null;
              return (
                <span key={index} className={part.added ? "diff-added" : ""}>
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "additions") {
    const additionParts = parts.filter((part) => part.added);
    if (additionParts.length === 0) return <div className="diff-view empty"><p>No additions found</p></div>;
    return (
      <div className="diff-view additions-only">
        <h4 className="panel-header additions-header">Additions</h4>
        <div className="diff-content">
          {additionParts.map((part, index) => (
            <div key={index} className="diff-block diff-added">
              {part.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "removals") {
    const removalParts = parts.filter((part) => part.removed);
    if (removalParts.length === 0) return <div className="diff-view empty"><p>No removals found</p></div>;
    return (
      <div className="diff-view removals-only">
        <h4 className="panel-header removals-header">Removals</h4>
        <div className="diff-content">
          {removalParts.map((part, index) => (
            <div key={index} className="diff-block diff-removed">
              {part.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "changes-only") {
    const additionParts = parts.filter((part) => part.added);
    const removalParts = parts.filter((part) => part.removed);
    if (additionParts.length === 0 && removalParts.length === 0)
      return <div className="diff-view empty"><p>No changes found</p></div>;
    return (
      <div className="diff-view changes-split">
        <div className="changes-panel additions-panel">
          <h4 className="panel-header additions-header">Additions ({additionParts.length})</h4>
          <div className="diff-content">
            {additionParts.length > 0 ? (
              additionParts.map((part, index) => (
                <div key={index} className="diff-block diff-added">
                  {part.value}
                </div>
              ))
            ) : (
              <p className="empty-message">No additions</p>
            )}
          </div>
        </div>
        <div className="changes-panel removals-panel">
          <h4 className="panel-header removals-header">Removals ({removalParts.length})</h4>
          <div className="diff-content">
            {removalParts.length > 0 ? (
              removalParts.map((part, index) => (
                <div key={index} className="diff-block diff-removed">
                  {part.value}
                </div>
              ))
            ) : (
              <p className="empty-message">No removals</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="diff-view unified">
      <h4 className="panel-header">Changes</h4>
      <div className="diff-content">
        {parts.map((part, index) => (
          <span key={index} className={part.added ? "diff-added" : part.removed ? "diff-removed" : ""}>
            {part.value}
          </span>
        ))}
      </div>
    </div>
  );
}

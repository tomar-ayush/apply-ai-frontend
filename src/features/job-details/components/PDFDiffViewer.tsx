import { useEffect, useMemo, useState } from "react";
import { diffWords, type Change } from "diff";
import { Check, ChevronLeft, ChevronRight, Edit3, FileX2, ListFilter, Loader2, Maximize2, Minimize2, RotateCcw, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { extractTextFromPdfUrl, type PdfTextDocument } from "@/lib/pdfText";
import "@/features/job-details/components/PDFDiffViewer.css";

type ViewMode = "side-by-side" | "unified" | "suggestions" | "editor" | "additions" | "removals" | "changes-only";

interface PDFDiffViewerProps {
  originalUrl?: string | null;
  optimizedUrl?: string | null;
  latexSource?: string;
  isLoading?: boolean;
  onRecompile?: (text: string) => void;
  isRecompiling?: boolean;
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

interface SuggestionItem {
  id: string;
  type: "addition" | "removal" | "modification";
  originalSentence?: string;
  suggestedSentence?: string;
  parts: Change[];
}

function parseSentenceSuggestions(parts: Change[]): SuggestionItem[] {
  const list: SuggestionItem[] = [];
  let currentParts: Change[] = [];
  let index = 0;

  const pushCurrent = () => {
    if (currentParts.length === 0) return;
    const hasAdded = currentParts.some((p) => p.added);
    const hasRemoved = currentParts.some((p) => p.removed);
    if (!hasAdded && !hasRemoved) {
      currentParts = [];
      return;
    }
    const type: "addition" | "removal" | "modification" =
      hasAdded && hasRemoved ? "modification" : hasAdded ? "addition" : "removal";

    const originalSentence = currentParts
      .filter((p) => !p.added)
      .map((p) => p.value)
      .join("")
      .trim();

    const suggestedSentence = currentParts
      .filter((p) => !p.removed)
      .map((p) => p.value)
      .join("")
      .trim();

    index++;
    list.push({
      id: `sug-${index}`,
      type,
      originalSentence,
      suggestedSentence,
      parts: [...currentParts],
    });
    currentParts = [];
  };

  for (const part of parts) {
    if (!part.added && !part.removed) {
      const segments = part.value.split(/(\.\s+|\n+)/);
      for (const seg of segments) {
        if (!seg) continue;
        currentParts.push({ value: seg, added: false, removed: false });
        if (/^(\.\s+|\n+)$/.test(seg)) {
          pushCurrent();
        }
      }
    } else {
      currentParts.push(part);
    }
  }

  pushCurrent();
  return list;
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

export function escapeLatexText(text: string): string {
  if (!text) return "";
  // Escape reserved LaTeX special characters: &, %, $, #, _ (if not already escaped)
  let escaped = text.replace(/(?<!\\)&/g, "\\&");
  escaped = escaped.replace(/(?<!\\)%/g, "\\%");
  escaped = escaped.replace(/(?<!\\)\$/g, "\\$");
  escaped = escaped.replace(/(?<!\\)#/g, "\\#");
  escaped = escaped.replace(/(?<!\\)_/g, "\\_");
  return escaped;
}

export function PDFDiffViewer({ originalUrl, optimizedUrl, latexSource, isLoading, onRecompile, isRecompiling }: PDFDiffViewerProps) {
  const [pages, setPages] = useState<PageDiff[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<ViewMode>("side-by-side");
  const [expanded, setExpanded] = useState(false);

  // Interactive suggestion states
  const [suggestionStates, setSuggestionStates] = useState<Record<string, "accepted" | "rejected" | "pending">>({});
  // Live Editor LaTeX state
  const [editedText, setEditedText] = useState<string>(latexSource || "");

  useEffect(() => {
    if (latexSource) {
      setEditedText(latexSource);
    }
  }, [latexSource]);

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
        if (!latexSource) {
          const fullModifiedText = diffs.map((d) => d.modifiedText).join("\n\n");
          setEditedText(fullModifiedText);
        }
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
  }, [originalUrl, optimizedUrl, latexSource]);

  const showLoading = isLoading || computing;
  const current = pages[page - 1];
  const numPages = pages.length;

  const currentSuggestions = useMemo(() => {
    if (!current?.parts) return [];
    return parseSentenceSuggestions(current.parts);
  }, [current]);

  const suggestionStats = useMemo(() => {
    let accepted = 0;
    let rejected = 0;
    let pending = 0;
    for (const sug of currentSuggestions) {
      const st = suggestionStates[sug.id] || "pending";
      if (st === "accepted") accepted++;
      else if (st === "rejected") rejected++;
      else pending++;
    }
    return { accepted, rejected, pending, total: currentSuggestions.length };
  }, [currentSuggestions, suggestionStates]);

  const handleSetSuggestion = (id: string, state: "accepted" | "rejected" | "pending") => {
    setSuggestionStates((prev) => ({ ...prev, [id]: state }));
  };

  const handleAcceptAll = () => {
    const next: Record<string, "accepted" | "rejected" | "pending"> = { ...suggestionStates };
    for (const sug of currentSuggestions) {
      next[sug.id] = "accepted";
    }
    setSuggestionStates(next);
    toast.success("All suggestions accepted");
  };

  const handleRejectAll = () => {
    const next: Record<string, "accepted" | "rejected" | "pending"> = { ...suggestionStates };
    for (const sug of currentSuggestions) {
      next[sug.id] = "rejected";
    }
    setSuggestionStates(next);
    toast.info("All suggestions rejected");
  };

  const handleResetSuggestions = () => {
    setSuggestionStates({});
    toast.info("Suggestion choices reset");
  };

  const handleApplyAcceptedSuggestions = () => {
    let updatedLatex = editedText || latexSource || "";
    if (!updatedLatex) {
      toast.error("No LaTeX source document available");
      return;
    }
    let count = 0;
    for (const sug of currentSuggestions) {
      const state = suggestionStates[sug.id] || "accepted";
      if (state === "accepted" && sug.originalSentence && sug.suggestedSentence) {
        const escapedSuggested = escapeLatexText(sug.suggestedSentence);
        if (updatedLatex.includes(sug.originalSentence)) {
          updatedLatex = updatedLatex.replace(sug.originalSentence, escapedSuggested);
          count++;
        } else {
          const escapedOriginal = escapeLatexText(sug.originalSentence);
          if (updatedLatex.includes(escapedOriginal)) {
            updatedLatex = updatedLatex.replace(escapedOriginal, escapedSuggested);
            count++;
          }
        }
      }
    }
    setEditedText(updatedLatex);
    if (onRecompile) {
      onRecompile(updatedLatex);
    } else {
      toast.success(`Applied ${count} accepted suggestion(s) to LaTeX editor!`);
      setMode("editor");
    }
  };

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

  const getEmptyDiffMessage = () => {
    if (!originalUrl && !optimizedUrl) {
      return "Upload an original LaTeX resume and generate an AI resume to view comparison.";
    }
    if (!originalUrl) {
      return "Original resume PDF has not been compiled yet. Upload a LaTeX resume in Settings or click 'Upload LaTeX' above.";
    }
    if (!optimizedUrl) {
      return "No AI-optimized resume generated for this job yet. Click 'Generate Optimized Resume' above to create one.";
    }
    return "No diff available for comparison.";
  };

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
              { mode: "suggestions", label: `Review Suggestions (${currentSuggestions.length})`, icon: ListFilter },
              { mode: "editor", label: "Live Editor", icon: Edit3 },
              { mode: "additions", label: "Additions" },
              { mode: "removals", label: "Removals" },
              { mode: "changes-only", label: "Changes Only" },
            ] as { mode: ViewMode; label: string; icon?: React.ElementType }[]
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.mode}
                className={`view-mode-tab ${mode === t.mode ? "active" : ""}`}
                onClick={() => setMode(t.mode)}
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {current ? (
        <div className="diff-view-wrap">
          {mode === "suggestions" ? (
            <div className="space-y-3">
              <div className="suggestions-header-bar">
                <div className="suggestions-stats">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    {suggestionStats.accepted} Accepted
                  </span>
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                    {suggestionStats.rejected} Rejected
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    {suggestionStats.pending} Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="xs" variant="outline" >This feature is not working rn </Button>
                  <Button size="xs" variant="outline" onClick={handleAcceptAll}>
                    <Check className="size-3 text-emerald-400" />
                    Accept All
                  </Button>
                  <Button size="xs" variant="outline" onClick={handleRejectAll}>
                    <X className="size-3 text-rose-400" />
                    Reject All
                  </Button>
                  <Button size="xs" variant="ghost" onClick={handleResetSuggestions} title="Reset choices">
                    <RotateCcw className="size-3" />
                  </Button>
                  {onRecompile && (
                    <Button size="xs" onClick={handleApplyAcceptedSuggestions} disabled={isRecompiling}>
                      <Sparkles className="size-3" />
                      {isRecompiling ? "Re-compiling…" : "Apply Accepted & Re-compile"}
                    </Button>
                  )}
                </div>
              </div>

              {currentSuggestions.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No AI suggestions found on this page.</div>
              ) : (
                currentSuggestions.map((sug, idx) => {
                  const state = suggestionStates[sug.id] || "pending";
                  return (
                    <div
                      key={sug.id}
                      className={`suggestion-card ${
                        state === "accepted" ? "status-accepted" : state === "rejected" ? "status-rejected" : ""
                      }`}
                    >
                      <div className="suggestion-card-header">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-muted-foreground">#{idx + 1}</span>
                          <span className="capitalize font-semibold text-foreground">{sug.type}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            state === "accepted"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : state === "rejected"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {state}
                        </span>
                      </div>

                      <div className="suggestion-body">
                        {sug.originalSentence && (
                          <div className="suggestion-pane">
                            <p className="suggestion-pane-label">Original Sentence Context</p>
                            <div className="diff-content text-sm leading-relaxed font-sans">
                              {sug.parts.map((p, i) => {
                                if (p.added) return null;
                                return (
                                  <span key={i} className={p.removed ? "diff-removed font-semibold" : ""}>
                                    {p.value}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {sug.suggestedSentence && (
                          <div className="suggestion-pane">
                            <p className="suggestion-pane-label">AI Rewritten Sentence Context</p>
                            <div className="diff-content text-sm leading-relaxed font-sans">
                              {sug.parts.map((p, i) => {
                                if (p.removed) return null;
                                return (
                                  <span key={i} className={p.added ? "diff-added font-semibold" : ""}>
                                    {p.value}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="suggestion-actions">
                        <Button
                          size="xs"
                          variant={state === "accepted" ? "secondary" : "outline"}
                          onClick={() => handleSetSuggestion(sug.id, state === "accepted" ? "pending" : "accepted")}
                        >
                          <Check className="size-3 text-emerald-400" />
                          {state === "accepted" ? "Accepted" : "Accept"}
                        </Button>
                        <Button
                          size="xs"
                          variant={state === "rejected" ? "secondary" : "outline"}
                          onClick={() => handleSetSuggestion(sug.id, state === "rejected" ? "pending" : "rejected")}
                        >
                          <X className="size-3 text-rose-400" />
                          {state === "rejected" ? "Rejected" : "Reject"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : mode === "editor" ? (
            <div className="editor-container">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Interactive Resume Editor</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span>{editedText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{editedText.length} chars</span>
                </div>
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="editor-textarea"
                placeholder="Edit resume text or LaTeX here…"
              />
              <div className="flex justify-end gap-2">
                {onRecompile && (
                  <Button
                    size="sm"
                    disabled={isRecompiling || !editedText.trim()}
                    onClick={() => onRecompile(editedText)}
                  >
                    <Sparkles className="size-3.5" />
                    {isRecompiling ? "Compiling PDF…" : "Re-compile PDF"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <DiffView parts={current.parts} mode={mode} originalText={current.originalText} modifiedText={current.modifiedText} />
          )}
        </div>
      ) : (
        <div className="flex h-44 flex-col items-center justify-center gap-2 text-center p-6 text-sm text-muted-foreground">
          {showLoading ? (
            <>
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>{isLoading ? "Generating optimized resume & computing diff…" : "Computing diff…"}</span>
            </>
          ) : (
            <>
              <FileX2 className="size-6 text-muted-foreground/60" />
              <span className="max-w-md">{getEmptyDiffMessage()}</span>
            </>
          )}
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
        <p className="text-sm font-medium text-foreground">Resume Changes & Review</p>
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

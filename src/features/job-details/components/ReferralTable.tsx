import { useState } from "react";
import { toast } from "sonner";
// import { Sparkles, Trash2, Users, Plus, Copy, Check, Search } from "lucide-react";
import { Sparkles, Trash2, Users, Copy, Check, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReferralStatusSelect } from "@/features/referrals/components/ReferralStatusSelect";
import { LinkedinUrlCell } from "@/features/referrals/components/LinkedinUrlCell";
import { AskForReferralButton } from "@/features/referrals/components/AskForReferralButton";
import { useCreateReferrals, useDeleteReferral, useGenerateReferrals } from "@/queries/useReferralsQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { shortDate } from "@/lib/format";
import { ReferralStatus } from "@/types/enums";
import type { CreateReferralRequest, ReferralResponse } from "@/types/api";

interface ReferralTableProps {
  jobId: string;
  referrals: ReferralResponse[];
  isLoading: boolean;
  queries: string[] | null | undefined;
  company?: string | null;
}

interface ParsedReferral extends CreateReferralRequest {
  linkedin_url: string | null;
}

// Extract referrals from pasted text. Handles three input shapes, in priority order:
//   1. Full HTML page source — pulls <a href="...linkedin.com/in/...">Name</a>.
//   2. Raw LinkedIn profile URLs — derives the name from the URL slug.
//   3. Plain-text blocks (name on first line + a linkedin URL in the block).
function nameFromSlug(url: string): string {
  const slug = url
    .replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, "")
    .replace(/\/$/, "")
    .split(/[?#]/)[0];
  return slug
    .split(/[-_]/)
    .filter((w) => w && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// LinkedIn anchors carry the full "Name - Title @Company" / "Name | Title" text.
// Keep only the part before the first title separator so we store just the name.
function cleanName(raw: string): string {
  const sep = raw.search(/\s[-–—|·@]\s/);
  return sep > 0 ? raw.slice(0, sep).trim() : raw.trim();
}

// Generic link labels that aren't real people — skip them (e.g. LinkedIn's
// "Read more" buttons, which also link to the profile URL).
const SKIP_LABELS = new Set([
  "read more",
  "see more",
  "show more",
  "more",
  "view profile",
  "view linkedin profile",
  "linkedin",
  "…",
  "...",
]);

// Normalize a LinkedIn URL for dedupe (strip trailing slash, query, hash, wrapping chars).
function normalizeUrl(u: string): string {
  return u
    .replace(/[)\]]+$/, "")
    .replace(/\/$/, "")
    .split(/[?#]/)[0]
    .toLowerCase();
}

function parseReferrals(text: string): ParsedReferral[] {
  const results: ParsedReferral[] = [];
  const seen = new Set<string>();

  // 1. Page source: <a href="...linkedin.com/in/...">Visible Name</a>
  const anchorRe = /<a\b[^>]*href=["']([^"']*linkedin\.com\/in\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(text)) !== null) {
    const url = normalizeUrl(m[1]);
    const rawName = m[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    const cleaned = cleanName(rawName);
    // If the anchor text is generic (e.g. "LinkedIn · Name", "Read more"), fall
    // back to the profile slug which still yields the correct name.
    const isGeneric = SKIP_LABELS.has(cleaned.toLowerCase()) || cleaned.toLowerCase().startsWith("linkedin");
    const name = isGeneric ? nameFromSlug(url) : cleaned;
    if (name.length < 2) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ name, linkedin_url: url });
  }
  if (results.length > 0) return results;

  // 2. Any linkedin.com/in/ URL — derive name from the slug.
  const urlRe = /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?/gi;
  const urls = [...new Set((text.match(urlRe) ?? []).map((u) => normalizeUrl(u)))];
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    results.push({ name: nameFromSlug(url), linkedin_url: url });
  }
  if (results.length > 0) return results;

  // 3. Plain-text blocks: name on first line + a linkedin URL in the block.
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const blockLinkedinRe = /(https?:\/\/[^\s]*linkedin\.com\/[^\s)]+)/i;
  const urlCleanup = (u: string) => u.replace(/[)\]]+$/, "");
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const name = cleanName(
      lines[0]
        .replace(/^[\d.\-•*]+\s*/, "")
        .replace(/\s*[—\-–]\s*.*$/, "")
        .replace(/\b(Software Engineer|Engineer|Recruiter|Manager|Developer|Designer|at .*)$/i, "")
        .trim()
    );
    const linkedinMatch = block.match(blockLinkedinRe);
    const linkedin_url = linkedinMatch ? urlCleanup(linkedinMatch[1]) : null;
    if (name && name.length > 1) results.push({ name, linkedin_url });
  }
  return results;
}

export function ReferralTable({ jobId, referrals, isLoading, queries, company }: ReferralTableProps) {
  const generateReferrals = useGenerateReferrals(jobId);
  const deleteReferral = useDeleteReferral(jobId);
  const createReferrals = useCreateReferrals(jobId);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<ParsedReferral[]>([]);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [queryCopied, setQueryCopied] = useState<string | null>(null);

  const queryList = queries ?? [];
  const handleQueryCopy = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setQueryCopied(query);
      setTimeout(() => setQueryCopied((c) => (c === query ? null : c)), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };
  const handleCopyAllQueries = async () => {
    try {
      await navigator.clipboard.writeText(queryList.join("\n"));
      toast.success("Copied all queries");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleGenerate = () => {
    generateReferrals.mutate(undefined, {
      onSuccess: (data) => toast.success(`Found ${data.generated} referral candidate${data.generated === 1 ? "" : "s"}`),
      onError: (error) => toast.error(getErrorMessage(error, "Could not generate referrals")),
    });
  };

  const handleDelete = (referralId: string, name: string) => {
    if (!window.confirm(`Delete referral "${name}"?`)) return;
    deleteReferral.mutate(referralId, {
      onSuccess: () => toast.success("Referral deleted"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not delete referral")),
    });
  };

  const handlePasteChange = (value: string) => {
    const extracted = parseReferrals(value);
    setPasteText(value);
    setParsed(extracted);

  };

  const handleCreate = () => {
    const valid = parsed.filter((r) => r.name);
    if (valid.length === 0) {
      toast.error("No names found in the pasted text");
      return;
    }
    createReferrals.mutate(
      { referrals: valid },
      {
        onSuccess: (created) => {
          toast.success(`Added ${created.length} referral${created.length === 1 ? "" : "s"}`);
          setPasteOpen(false);
          setPasteText("");
          setParsed([]);
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not add referrals")),
      }
    );
  };

  const columns: DataTableColumn<ReferralResponse>[] = [

    { key: "name", header: "Name", render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    {
      key: "linkedin",
      header: "LinkedIn",
      render: (r) => <LinkedinUrlCell jobId={jobId} referralId={r.id} status={r.status} linkedinUrl={r.linkedin_url} />,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <ReferralStatusSelect jobId={jobId} referralId={r.id} status={r.status} linkedinUrl={r.linkedin_url} />,
    },
    {
      key: "connect",
      header: "",
      render: (r) =>
        r.status === ReferralStatus.NOT_CONTACTED && r.linkedin_url ? (
          <AskForReferralButton jobId={jobId} referralId={r.id} name={r.name} linkedinUrl={r.linkedin_url} company={company} />
        ) : null,
    },
    {
      key: "asked_at",
      header: "Asked",
      render: (r) => <span className="text-muted-foreground">{r.asked_at ? shortDate(r.asked_at) : "—"}</span>,
    },
    {
      key: "responded_at",
      header: "Responded",
      render: (r) => <span className="text-muted-foreground">{r.responded_at ? shortDate(r.responded_at) : "—"}</span>,
    },
    {
      key: "delete",
      header: "",
      className: "w-8 text-right",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={deleteReferral.isPending}
          onClick={() => handleDelete(r.id, r.name)}
          className="text-muted-foreground hover:text-rose-400"
        >
          <Trash2 className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Referrals</p>
        <div className="flex items-center gap-2">
          {/* 
          {queryList.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setQueriesOpen(true)}>
              <Copy className="size-3.5" />
              Search queries
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setPasteOpen(true)}>
            <Plus className="size-3.5" />
            Paste search results
          </Button>
          */}
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generateReferrals.isPending}>
            <Sparkles className="size-3.5" />
            {generateReferrals.isPending ? "Searching…" : referrals.length ? "Find more" : "Generate Referrals"}
          </Button>
        </div>
      </div>
      <DataTable
        data={referrals}
        columns={columns}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={Users}
            title="No referrals yet"
            description="Generate referral candidates from your network via AI."
            action={{ label: "Generate Referrals", onClick: handleGenerate }}
            className="py-10"
          />
        }
      />

      <Dialog open={queriesOpen} onOpenChange={setQueriesOpen}>
        <DialogContent className="grid-rows-[auto_1fr_auto] sm:max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Google search queries</DialogTitle>
            <DialogDescription>
              Click any query to copy it, then run it in Google or LinkedIn to find referrals.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-1.5 overflow-y-auto pr-1">
            {queryList.map((query, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQueryCopy(query)}
                className="flex min-w-0 w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
                title="Click to copy"
              >
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{query}</span>
                {queryCopied === query ? (
                  <Check className="size-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setQueriesOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyAllQueries}>
              <Copy className="size-3.5" />
              Copy all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="grid-rows-[auto_1fr_auto] sm:max-w-lg max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Paste search results</DialogTitle>
            <DialogDescription>
              Paste Google/LinkedIn results below. We'll extract names and LinkedIn URLs, then add them as referrals.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
            <Textarea
              value={pasteText}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder={"Paste results, e.g.\nJane Doe — Software Engineer at Acme\nhttps://www.linkedin.com/in/janedoe\n\nJohn Smith — Recruiter\nhttps://www.linkedin.com/in/johnsmith"}
              className="min-h-40 font-mono text-xs"
            />

            {parsed.length > 0 && (
              <div className="max-h-48 space-y-1.5 overflow-auto rounded-lg border border-border p-2">
                <p className="px-1 text-xs font-medium text-muted-foreground">
                  Found {parsed.length} referral{parsed.length === 1 ? "" : "s"}:
                </p>
                {parsed.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-sm">
                    <span className="flex-1 truncate font-medium text-foreground">{r.name}</span>
                    {r.linkedin_url ? (
                      <span className="truncate text-xs text-emerald-500">linkedin ✓</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">no url</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPasteOpen(false);
                setPasteText("");
                setParsed([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createReferrals.isPending || parsed.filter((r) => r.name).length === 0}
            >
              {createReferrals.isPending ? "Adding…" : `Add ${parsed.filter((r) => r.name).length || ""} referrals`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

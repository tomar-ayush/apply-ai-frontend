import { useState } from "react";
import { Download, ExternalLink, Puzzle, Check, Copy, Sparkles, Layers, ShieldCheck, ArrowRight, Laptop } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border border-border bg-slate-950 font-mono text-xs text-slate-100 shadow-inner">
      {label && (
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3.5 py-2 text-[11px] text-slate-400">
          <span className="font-sans font-medium">{label}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span className="text-[10px] font-sans">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 overflow-x-auto p-3.5">
        <code className="whitespace-pre break-all">{code}</code>
        {!label && (
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={handleCopy}
            className="text-slate-400 hover:bg-slate-800 hover:text-slate-100 shrink-0"
            title="Copy to clipboard"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}

export function InstallExtensionPage() {
  const downloadUrl = "https://github.com/tomar-ayush/applyai-assistant/archive/refs/tags/v0.0.0.zip";
  const githubUrl = "https://github.com/tomar-ayush/applyai-assistant";

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Puzzle className="size-3.5" />
              Chrome Extension Setup
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Install ApplyAI Chrome Extension
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Automate LinkedIn networking and referral outreach directly in your Chrome browser with full session synchronization.
            </p>
          </div>
          <div className="flex flex-wrap shrink-0 items-center gap-3">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Download className="size-4" />
              Download v0.0.0 Zip
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="size-3.5" />
              GitHub Repo
            </a>
          </div>
        </div>
      </div>

      {/* Step by Step Installation Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quick Installation Steps</h2>
            <p className="text-xs text-muted-foreground">Follow these 4 simple steps to load the unpacked extension in Chrome.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Step 1 */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </div>
              <h3 className="text-sm font-semibold text-foreground">Download &amp; Extract Zip</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Download the release archive <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">v0.0.0.zip</code> and extract the contents to a folder on your computer.
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Download className="size-3.5" />
              Download v0.0.0.zip
            </a>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </div>
              <h3 className="text-sm font-semibold text-foreground">Open Chrome Extensions</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Open Google Chrome and navigate to <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">chrome://extensions</code> in your address bar (or Edge: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">edge://extensions</code>).
            </p>
            <CodeBlock code="chrome://extensions" />
          </div>

          {/* Step 3 */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </div>
              <h3 className="text-sm font-semibold text-foreground">Enable Developer Mode</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Toggle on the <span className="font-semibold text-foreground font-sans">Developer mode</span> switch located in the top-right corner of the Extensions page.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <span>Developer mode allows loading local unpacked Chrome extensions securely.</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                4
              </div>
              <h3 className="text-sm font-semibold text-foreground">Load Unpacked Extension</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Click the <span className="font-semibold text-foreground font-sans">"Load unpacked"</span> button in the top-left menu and select the unzipped <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">applyai-assistant-0.0.0</code> directory.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <Layers className="size-4 text-sky-500 shrink-0" />
              <span>Once loaded, pin ApplyAI Assistant to your toolbar for instant access!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Laptop className="size-4 text-primary" />
          Extension Features &amp; Capabilities
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-emerald-500" />
              Automated Connections
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Sends automated connection requests to target employees and recruiters directly on LinkedIn.
            </p>
          </div>
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-emerald-500" />
              Personalized Referral Notes
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Populates and attaches custom referral notes and greetings saved directly from your profile.
            </p>
          </div>
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-emerald-500" />
              100% Local Privacy
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Runs in your browser using your active LinkedIn session. No passwords or tokens sent to external servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

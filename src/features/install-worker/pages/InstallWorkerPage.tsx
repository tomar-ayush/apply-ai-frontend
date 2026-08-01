import { useState } from "react";
import { Check, Copy, Terminal, Monitor, Cpu, FileCode2, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Command copied to clipboard!");
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

export function InstallWorkerPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Cpu className="size-3.5" />
              Local Worker Setup
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Install & Run Automation Worker
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Run automated LinkedIn networking and Workday job applications right from your local machine with full session sync.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://github.com/tomar-ayush/resume-agents"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="size-3.5" />
              GitHub Repository
            </a>
          </div>
        </div>
      </div>

      {/* 1-Line Remote Installers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Terminal className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">1-Line Remote Installers</h2>
            <p className="text-xs text-muted-foreground">Run either command in your terminal to install the worker automatically.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">macOS &amp; Linux</span>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">install.sh</span>
            </div>
            <CodeBlock
              code="curl -fsSL https://raw.githubusercontent.com/tomar-ayush/resume-agents/main/install.sh | bash"
              label="Terminal Command"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Windows PowerShell</span>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">install.ps1</span>
            </div>
            <CodeBlock
              code="iwr -useb https://raw.githubusercontent.com/tomar-ayush/resume-agents/main/install.ps1 | iex"
              label="PowerShell Command"
            />
          </div>
        </div>
      </div>

      {/* Methods to Launch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Method 1: Desktop Icon */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Monitor className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Method 1: Desktop Icon</h3>
              <p className="text-xs text-muted-foreground">For graphical users — no terminal needed</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Once setup is complete, you do not need to open a terminal or execute commands. You can launch the app by double-clicking the generated desktop shortcut:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
              <Sparkles className="mt-0.5 size-3.5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">macOS / Linux:</span> Double-click{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">Start LinkedIn Automation.command</code> on your Desktop.
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
              <Sparkles className="mt-0.5 size-3.5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Windows:</span> Double-click{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">Start LinkedIn Automation.bat</code> on your Desktop.
              </div>
            </li>
          </ul>

          <p className="text-[11px] text-muted-foreground/80 italic">
            (Or double-click <code className="font-mono text-[10px]">Start.command</code> / <code className="font-mono text-[10px]">Start.bat</code> inside the project folder).
          </p>
        </div>

        {/* Method 2: Command Line */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Terminal className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Method 2: Command Line</h3>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground">For developers &amp; terminal users</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            If you prefer using the terminal, run either of these standard commands inside the project folder:
          </p>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">Start the server directly:</p>
              <CodeBlock code="npm start" />
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">Run via alias:</p>
              <CodeBlock code="apply-ai" />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Required Warning */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Important: Update your <code className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-amber-400">information.js</code> File</h3>
              <FileCode2 className="size-4 text-amber-400" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Before running automated Workday applications, ensure you update the <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium text-foreground">information.js</code> file inside the project directory with your personal details:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Fill in your contact information (name, email, phone number, address).</li>
              <li>Provide your work experience history, education details, and skills.</li>
              <li>Complete the Workday questionnaire defaults (sponsorship status, legal authorization, etc.).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

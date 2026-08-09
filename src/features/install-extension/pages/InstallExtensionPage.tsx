import { useState } from "react";
import { Download, ExternalLink, Check, Copy, Puzzle, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";

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

const STEPS = [
  {
    title: "Download & Unzip Archive",
    description:
      "Download the release zip and extract (unzip) its contents to a folder on your computer before proceeding.",
    extra: "download" as const,
  },
  {
    title: "Open Chrome Extensions",
    description:
      "Type the address below into your Chrome address bar and hit Enter. This opens Chrome's extension manager.",
    extra: "code" as const,
  },
  {
    title: "Enable Developer Mode",
    description:
      "Find the Developer mode toggle in the top-right corner of the Extensions page and flip it on. This lets Chrome load unpacked extensions.",
    extra: "toggle" as const,
  },
  {
    title: "Load Unpacked Extension",
    description:
      "Click \"Load unpacked\" in the top-left menu, then select the folder you unzipped in Step 1. Pin it to your toolbar!",
    extra: "done" as const,
  },
];

export function InstallExtensionPage() {
  const downloadUrl =
    "https://github.com/tomar-ayush/applyai-assistant/archive/refs/tags/v1.0.0.zip";
  const githubUrl = "https://github.com/tomar-ayush/applyai-assistant";

  return (
    <div>
      <PageHeader
        title="Install Extension"
        pill="Chrome"
        actions={
          <>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink className="size-4" />
              GitHub
            </a>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "default" })}
            >
              <Download className="size-4" />
              Download v1.0.0
            </a>
          </>
        }
      />

      <div className="space-y-6 p-4 md:space-y-10 md:p-8">
        {/* Intro Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card p-8 md:p-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-background">
                  <Puzzle className="size-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  ApplyAI Assistant
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our Chrome extension automates LinkedIn networking directly from your browser.
                It suggests connections and drafts personalized referral requests using your active session, with zero
                external server access.
              </p>
            </div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex h-14 shrink-0 items-center gap-3 rounded-full bg-foreground pl-6 pr-2 text-sm font-bold text-background shadow-lg shadow-foreground/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.97]"
            >
              Download Extension
              <div className="flex size-10 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:translate-y-0.5">
                <ArrowDown className="size-4" />
              </div>
            </a>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight">Setup in 4 steps</h3>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-2xl border border-border bg-card p-6 md:p-8 transition-shadow duration-300 hover:shadow-md"
              >
                {/* Step Number */}
                <div className="flex items-start gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-black tabular-nums text-foreground">
                    {i + 1}
                  </span>
                  <div className="space-y-2 min-w-0 flex-1">
                    <h4 className="text-base font-bold tracking-tight text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step-specific content */}
                <div className="mt-5 pl-0 md:pl-[4.25rem]">
                  {step.extra === "download" && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                    >
                      <Download className="size-4 text-muted-foreground" />
                      applyai-assistant-v1.0.0.zip
                    </a>
                  )}
                  {step.extra === "code" && (
                    <div className="max-w-sm">
                      <CodeBlock code="chrome://extensions" />
                    </div>
                  )}
                  {step.extra === "toggle" && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                      <div className="h-5 w-9 rounded-full bg-emerald-500 relative">
                        <div className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Developer mode</span>
                      <Check className="size-4 text-emerald-500 ml-auto" />
                    </div>
                  )}
                  {step.extra === "done" && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                      <Check className="size-4 text-emerald-500" />
                      <span className="text-sm font-medium text-foreground">
                        Pin it to your toolbar and you're all set
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What it does */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4 md:px-8">
            <h3 className="text-base font-bold tracking-tight">What the extension does</h3>
          </div>
          <div className="divide-y divide-border">
            {[
              {
                title: "Suggests connections",
                desc: "Helps you identify relevant employees and recruiters at your target company on LinkedIn.",
              },
              {
                title: "Drafts personalized referral messages",
                desc: "Provides a custom note draft generated from your profile and the target role.",
              },
              {
                title: "Runs 100% in your browser",
                desc: "Uses your active LinkedIn session. No passwords, API keys, or data ever leave your machine.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-1 px-6 py-5 md:flex-row md:items-start md:gap-12 md:px-8"
              >
                <h4 className="text-sm font-semibold text-foreground md:w-64 md:shrink-0">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { Save, Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import { useWorkerHealth, useWorkerUrl } from "@/features/job-details/hooks/useWorkerHealth";

export function WorkerStatusCard() {
  const [workerUrl, setWorkerUrl] = useWorkerUrl();
  const [draft, setDraft] = useState(workerUrl);
  const health = useWorkerHealth(workerUrl);
  const isHealthy = health.data?.status === "ok";

  const handleSave = () => {
    setWorkerUrl(draft);
    toast.success(draft ? "Worker URL saved" : "Worker URL cleared");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Automation Worker</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
            !workerUrl
              ? "bg-zinc-500/10 text-zinc-400"
              : isHealthy
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              !workerUrl ? "bg-zinc-500" : isHealthy ? "bg-emerald-500" : "bg-rose-500"
            )}
          />
          {!workerUrl ? "Not configured" : isHealthy ? "Healthy" : "Unreachable"}
        </span>
      </div>

      <p className="mb-2 text-xs text-muted-foreground">
        Paste the local agent's tunnel URL (e.g. a Cloudflare tunnel) so the backend can reach it to run automations.
      </p>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://xxxx.trycloudflare.com"
          className="font-mono text-xs"
        />
        <Button size="sm" variant="outline" onClick={handleSave} disabled={draft === workerUrl}>
          <Save className="size-3.5" />
          Save
        </Button>
      </div>

      {workerUrl && health.dataUpdatedAt > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Last checked {relativeTime(new Date(health.dataUpdatedAt).toISOString())}</p>
      )}
    </div>
  );
}

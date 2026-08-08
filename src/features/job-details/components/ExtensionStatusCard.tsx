import { useEffect, useState } from "react";
import { Check, Cpu, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStoredExtensionId,
  setStoredExtensionId,
  pingExtension,
  type ExtensionPingResult,
} from "@/lib/extension";

export function ExtensionStatusCard() {
  const [extId, setExtId] = useState(getStoredExtensionId());
  const [status, setStatus] = useState<ExtensionPingResult | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async (customId?: string) => {
    setChecking(true);
    try {
      const res = await pingExtension(customId);
      setStatus(res);
      if (res.connected) {
        toast.success(`Extension connected via ${res.source}!`);
      } else {
        toast.error("Extension not detected. Make sure it is installed and enabled.");
      }
    } catch (err: any) {
      setStatus({ connected: false, error: err?.message });
      toast.error("Error pinging extension");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleSaveId = () => {
    setStoredExtensionId(extId);
    toast.success("Extension ID saved!");
    checkConnection(extId);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-sm text-foreground">
          <Cpu className="size-4 text-primary" />
          <span>Chrome Extension Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${
              status?.connected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500"
            }`}
          />
          <span className="text-xs font-semibold">
            {checking ? "Checking..." : status?.connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        LinkedIn automation runs directly inside your Chrome browser using the ApplyAI extension.
      </p>

      {/* Fallback Extension ID Form */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Extension ID (Fallback)
        </label>
        <div className="flex gap-2">
          <Input
            value={extId}
            onChange={(e) => setExtId(e.target.value)}
            placeholder="e.g. abcdefghijklmnopqrstuvwxyz"
            className="h-8 text-xs font-mono"
          />
          <Button size="xs" variant="secondary" onClick={handleSaveId}>
            Save
          </Button>
          <Button size="xs" variant="outline" onClick={() => checkConnection()} disabled={checking}>
            <RefreshCw className={`size-3 ${checking ? "animate-spin" : ""}`} />
            Test
          </Button>
        </div>
      </div>

      {/* Helper text / status details */}
      {status?.connected && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
          <Check className="size-3.5 shrink-0" />
          <span>Ready for automated LinkedIn messaging! (v{status.version})</span>
        </div>
      )}

      {!status?.connected && !checking && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-400 space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>Extension Not Found</span>
          </div>
          <p className="text-[10px] text-amber-300/80">
            Open <code className="bg-amber-950 px-1 py-0.5 rounded">chrome://extensions</code>, load unpacked from{" "}
            <code className="bg-amber-950 px-1 py-0.5 rounded">linkedin_note_extension</code>, and copy its ID above.
          </p>
        </div>
      )}
    </div>
  );
}

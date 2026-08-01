import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookmarkCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkerHealth, useWorkerUrl } from "@/features/job-details/hooks/useWorkerHealth";
import { useConnectReferral } from "@/queries/useReferralsQueries";
import { useMe, useUpdateLinkedinMessage } from "@/queries/useUsersQueries";
import { getErrorMessage } from "@/lib/axios-error";

interface AskForReferralButtonProps {
  jobId: string;
  referralId: string;
  name: string;
  linkedinUrl: string;
  company?: string | null;
}

export function stripGreetingPrefix(text: string, name?: string): string {
  if (!text) return "";
  let clean = text.trim();
  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    clean = clean.replace(new RegExp(`^(Hi|Hello|Hey)\\s+${escapedName}[,\\s]*`, "i"), "");
  }
  clean = clean.replace(/^(Hi|Hello|Hey)\s+[^,\n]+[,:\s]*/i, "");
  clean = clean.replace(/^(Hi|Hello|Hey)[,:\s]*/i, "");
  return clean.trim();
}

export function AskForReferralButton({ jobId, referralId, name, linkedinUrl, company: _company }: AskForReferralButtonProps) {
  const [workerUrl] = useWorkerUrl();
  const health = useWorkerHealth(workerUrl);
  const isWorkerHealthy = health.data?.status === "ok";
  const connectReferral = useConnectReferral(jobId);
  const meQuery = useMe();
  const updateLinkedinMessage = useUpdateLinkedinMessage();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [hasUserEdited, setHasUserEdited] = useState(false);

  useEffect(() => {
    if (open && !hasUserEdited) {
      if (meQuery.data?.linkedin_message) {
        const body = stripGreetingPrefix(meQuery.data.linkedin_message, name);
        setMessage(`Hi ${name}, ${body}`);
      } else {
        setMessage(`Hi ${name}, I'm exploring opportunities and would love to connect!`);
      }
    }
  }, [open, hasUserEdited, meQuery.data?.linkedin_message, name]);

  const disabledReason = !workerUrl
    ? "Configure the automation worker URL first."
    : !isWorkerHealthy
      ? "The automation worker must be healthy first."
      : undefined;

  const handleSend = () => {
    connectReferral.mutate(
      { referralId, payload: { linkedin_url: linkedinUrl, message, agent_url: workerUrl } },
      {
        onSuccess: () => {
          toast.success("Connection request queued with the automation worker");
          setOpen(false);
        },
        onError: (error) => toast.error(getErrorMessage(error, "Could not queue the connection request")),
      }
    );
  };

  const handleSaveToDb = () => {
    if (!message.trim()) return;
    const bodyToSave = stripGreetingPrefix(message, name);
    if (!bodyToSave) {
      toast.error("Please enter a message body after the greeting.");
      return;
    }
    updateLinkedinMessage.mutate(bodyToSave, {
      onSuccess: () => toast.success("Default Message Updated"),
      onError: (error) => toast.error(getErrorMessage(error, "Could not save LinkedIn message")),
    });
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        disabled={!!disabledReason}
        title={disabledReason}
        onClick={() => {
          setHasUserEdited(false);
          setOpen(true);
        }}
      >
        <Send className="size-3" />
        Ask for referral
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask {name} for a referral</DialogTitle>
            <DialogDescription>
              The automation worker will send this connection request via LinkedIn.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setHasUserEdited(true);
            }}
            rows={4}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {meQuery.data?.linkedin_message && message === meQuery.data.linkedin_message && (
              <span className="text-[11px] text-emerald-400 font-medium">Loaded from your profile</span>
            )}
            <span className={message.length > 300 ? "ml-auto text-destructive" : "ml-auto"}>
              {message.length}/300
            </span>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={handleSaveToDb}
              disabled={updateLinkedinMessage.isPending || !message.trim()}
              title="Save this message template to your profile in DB"
            >
              <BookmarkCheck className="size-3.5 text-primary" />
              {updateLinkedinMessage.isPending ? "Saving…" : "Save as default"}
            </Button>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSend} disabled={connectReferral.isPending || !message.trim()}>
                {connectReferral.isPending ? "Sending…" : "Send"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

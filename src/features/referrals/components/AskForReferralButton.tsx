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
import { useCompleteReferral, useConnectReferral } from "@/queries/useReferralsQueries";
import { useMe, useUpdateLinkedinMessage } from "@/queries/useUsersQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { dispatchTaskToExtension } from "@/lib/extension";

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
  const connectReferral = useConnectReferral(jobId);
  const completeReferral = useCompleteReferral(jobId);
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
      }
    }
  }, [open, hasUserEdited, meQuery.data?.linkedin_message, name]);

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "APPLYAI_TASK_RESPONSE" && event.data?.originalType === "APPLYAI_LINKEDIN_TASK") {
        // Strict check to prevent updating all referrals on the page at once
        const targetReferralId = event.data.referral_id;
        if (!targetReferralId || targetReferralId !== referralId) {
          return;
        }

        console.log("[DEBUG] Frontend received task response from extension:", event.data);
        const state = event.data.state || (event.data.success ? "completed" : "failed");

        if (event.data.success) {
          toast.success("LinkedIn connection request completed!");
        } else if (event.data.error) {
          toast.error(`Extension notice: ${event.data.error}`);
        }

        setIsSending(false);

        // Inform backend of extension task status update
        completeReferral.mutate({
          referralId: targetReferralId,
          payload: {
            state,
            task_id: event.data.task_id || null,
            error: event.data.error || null,
          },
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [referralId, completeReferral]);

  const handleSend = () => {
    const taskId = crypto.randomUUID();
    setIsSending(true);
    setOpen(false);

    const baseUrl = import.meta.env.VITE_BACKEND_API_BASE_URL || window.location.origin;
    const callback_url = `${baseUrl}/tasks/referrals/${referralId}/complete`.replace(/([^:]\/)\/+/g, "$1");

    // 1. Dispatch task to Chrome Extension IMMEDIATELY for snappy UI automation
    dispatchTaskToExtension({
      referral_id: referralId,
      linkedin_url: linkedinUrl,
      message,
      referral_name: name,
      task_id: taskId,
      callback_url,
    });
    toast.success("Connection request dispatched to Chrome Extension!");

    // Failsafe timeout to clear the loading state if extension never responds
    setTimeout(() => setIsSending(false), 120000);

    // 2. Inform backend to create the task in parallel
    connectReferral.mutate(
      {
        referralId,
        payload: { linkedin_url: linkedinUrl, message, task_id: taskId },
      },
      {
        onError: (error) => {
          toast.error(getErrorMessage(error, "Warning: Could not sync referral task to backend"));
        },
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
        disabled={isSending || connectReferral.isPending}
        onClick={() => {
          setHasUserEdited(false);
          setOpen(true);
        }}
      >
        <Send className="size-3" />
        {isSending ? "Sending…" : "Ask for referral"}
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

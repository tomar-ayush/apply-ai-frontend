import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
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
import { getErrorMessage } from "@/lib/axios-error";

interface AskForReferralButtonProps {
  jobId: string;
  referralId: string;
  name: string;
  linkedinUrl: string;
  company?: string | null;
}

export function AskForReferralButton({ jobId, referralId, name, linkedinUrl, company }: AskForReferralButtonProps) {
  const [workerUrl] = useWorkerUrl();
  const health = useWorkerHealth(workerUrl);
  const isWorkerHealthy = health.data?.status === "ok";
  const connectReferral = useConnectReferral(jobId);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    // `Hi ${name}, I'm exploring opportunities and would love to connect!`
    `Hi ${name}\n\nI came across the ${company ? `${company} ` : ""}role and I'm really interested. I'd appreciate a referral if you feel my profile fits this role well.`
  );

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

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        disabled={!!disabledReason}
        title={disabledReason}
        onClick={() => setOpen(true)}
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

          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={connectReferral.isPending || !message.trim()}>
              {connectReferral.isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

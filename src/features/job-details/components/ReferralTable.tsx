import { useMemo } from "react";
import { toast } from "sonner";
import { Sparkles, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReferralStatusSelect } from "@/features/referrals/components/ReferralStatusSelect";
import { LinkedinUrlCell } from "@/features/referrals/components/LinkedinUrlCell";
import { useDeleteReferral, useGenerateReferrals } from "@/queries/useReferralsQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { shortDate } from "@/lib/format";
import type { ReferralResponse } from "@/types/api";

interface ReferralTableProps {
  jobId: string;
  referrals: ReferralResponse[];
  isLoading: boolean;
}

export function ReferralTable({ jobId, referrals, isLoading }: ReferralTableProps) {
  console.log("referrals", referrals);
  const generateReferrals = useGenerateReferrals(jobId);
  const deleteReferral = useDeleteReferral(jobId);

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

  // Lower priority number = better candidate to contact first (set by referral generation);
  // referrals without a priority sort to the end.
  const sortedReferrals = useMemo(
    () =>
      [...referrals].sort((a, b) => {
        const ap = a.priority ?? Number.POSITIVE_INFINITY;
        const bp = b.priority ?? Number.POSITIVE_INFINITY;
        return ap - bp;
      }),
    [referrals]
  );

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
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generateReferrals.isPending}>
          <Sparkles className="size-3.5" />
          {generateReferrals.isPending ? "Searching…" : referrals.length ? "Find more" : "Generate Referrals"}
        </Button>
      </div>
      <DataTable
        data={sortedReferrals}
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
    </div>
  );
}

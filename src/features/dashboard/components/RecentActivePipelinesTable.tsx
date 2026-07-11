import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { relativeTime } from "@/lib/format";
import { TERMINAL_JOB_STATUSES } from "@/types/enums";
import type { JobDetailResponse } from "@/types/api";

interface RecentActivePipelinesTableProps {
  jobs: JobDetailResponse[];
  isLoading: boolean;
  onAddJob: () => void;
}

export function RecentActivePipelinesTable({ jobs, isLoading, onAddJob }: RecentActivePipelinesTableProps) {
  const navigate = useNavigate();

  const rows = useMemo(
    () =>
      jobs
        .filter((job) => !TERMINAL_JOB_STATUSES.includes(job.status))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 6),
    [jobs]
  );

  const columns: DataTableColumn<JobDetailResponse>[] = [
    { key: "company", header: "Company", render: (job) => job.company || "—" },
    { key: "role", header: "Role", render: (job) => job.role || "—" },
    { key: "status", header: "Status", render: (job) => <StatusBadge kind="job" status={job.status} /> },
    {
      key: "updated_at",
      header: "Updated At",
      render: (job) => <span className="text-muted-foreground">{relativeTime(job.updated_at)}</span>,
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      render: () => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          Manage <ArrowRight className="size-3.5" />
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Recent Active Pipelines</p>
          <p className="text-xs text-muted-foreground">Click any row to open the Job Detail workspace.</p>
        </div>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(job) => job.id}
        onRowClick={(job) => navigate(`/jobs/${job.id}`)}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No jobs yet"
            description="Add your first Workday URL to begin tracking applications."
            action={{ label: "Add Job", onClick: onAddJob }}
          />
        }
      />
    </div>
  );
}

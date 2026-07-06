import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { relativeTime, initials } from "@/lib/format";
import type { JobResponse } from "@/types/api";

interface JobsTableProps {
  jobs: JobResponse[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onAddJob: () => void;
}

export function JobsTable({ jobs, isLoading, hasActiveFilters, onAddJob }: JobsTableProps) {
  const navigate = useNavigate();

  const columns: DataTableColumn<JobResponse>[] = [
    {
      key: "company",
      header: "Company",
      render: (job) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[11px] font-medium text-muted-foreground">
            {initials(job.company || "?")}
          </span>
          <span className="font-medium text-foreground">{job.company || "Unknown company"}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (job) => job.role || "—" },
    { key: "status", header: "Status", render: (job) => <StatusBadge kind="job" status={job.status} /> },
    {
      key: "updated_at",
      header: "Updated At",
      render: (job) => <span className="text-muted-foreground">{relativeTime(job.updated_at)}</span>,
    },
    {
      key: "arrow",
      header: "",
      className: "w-8 text-right",
      render: () => <ChevronRight className="ml-auto size-4 text-muted-foreground" />,
    },
  ];

  return (
    <DataTable
      data={jobs}
      columns={columns}
      getRowId={(job) => job.id}
      onRowClick={(job) => navigate(`/jobs/${job.id}`)}
      isLoading={isLoading}
      emptyState={
        hasActiveFilters ? (
          <EmptyState title="No jobs match your filters" description="Try adjusting the search or filters above." />
        ) : (
          <EmptyState
            title="No jobs yet"
            description="Add your first Workday URL to begin tracking applications."
            action={{ label: "Add Job", onClick: onAddJob }}
          />
        )
      }
    />
  );
}

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { TourHighlight } from "@/components/shared/TourHighlight";
import { Button } from "@/components/ui/button";
import { useJobsList } from "@/queries/useJobsQueries";
import { JobsFilterBar, type SortOption } from "@/features/jobs/components/JobsFilterBar";
import { JobsTable } from "@/features/jobs/components/JobsTable";
import { AddJobDialog } from "@/features/jobs/components/AddJobDialog";
import { getErrorMessage } from "@/lib/axios-error";
import { JobStatus } from "@/types/enums";
import { JOB_STATUS_MAP } from "@/lib/statusMaps";
import { DEMO_JOBS_LIST } from "@/lib/demo-data";
import type { JobDetailResponse } from "@/types/api";

const EMPTY_JOBS: JobDetailResponse[] = [];

export function JobsListPage() {
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [params, setParams] = useSearchParams();

  const statusParam = params.get("status");
  const status = statusParam && statusParam in JOB_STATUS_MAP ? (statusParam as JobStatus) : "ALL";
  const company = params.get("company") ?? "ALL";
  const sort = (params.get("sort") as SortOption) || "updated_desc";
  const search = params.get("q") ?? "";

  const jobsQuery = useJobsList(status === "ALL" ? undefined : status);
  let jobs = jobsQuery.data ?? EMPTY_JOBS;
  
  if (jobsQuery.isSuccess && jobs.length === 0 && params.has("tourStep")) {
    jobs = DEMO_JOBS_LIST as unknown as JobDetailResponse[];
  }

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "ALL") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const companies = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.company).filter((c): c is string => !!c))).sort(),
    [jobs]
  );

  const visibleJobs = useMemo(() => {
    let result: JobDetailResponse[] = jobs;

    if (company !== "ALL") {
      result = result.filter((j) => j.company === company);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (j) => j.company?.toLowerCase().includes(q) || j.role?.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    if (sort === "updated_desc") {
      sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sort === "company_asc") {
      sorted.sort((a, b) => (a.company ?? "").localeCompare(b.company ?? ""));
    } else if (sort === "status") {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    return sorted;
  }, [jobs, company, search, sort]);

  const hasActiveFilters = status !== "ALL" || company !== "ALL" || !!search.trim();

  return (
    <div>
      <PageHeader
        title="Jobs"
        pill="All applications"
        actions={
          <Button size="sm" onClick={() => setAddJobOpen(true)} className="px-2 sm:px-3">
            <Plus className="size-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Add Job</span>
          </Button>
        }
      />

      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        {jobsQuery.isError && (
          <ErrorBanner
            message={getErrorMessage(jobsQuery.error, "Could not load your jobs.")}
            onRetry={() => jobsQuery.refetch()}
          />
        )}

        <JobsFilterBar
          search={search}
          onSearchChange={(v) => updateParam("q", v)}
          status={status}
          onStatusChange={(v) => updateParam("status", v)}
          company={company}
          onCompanyChange={(v) => updateParam("company", v)}
          companies={companies}
          sort={sort}
          onSortChange={(v) => updateParam("sort", v)}
        />

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active Applications</p>
              <p className="text-xs text-muted-foreground">Every row opens the dedicated Job Detail workspace.</p>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">{visibleJobs.length} tracked jobs</span>
          </div>
          <TourHighlight activePath="/jobs" stepIndex={2}>
            <JobsTable
              jobs={visibleJobs}
              isLoading={jobsQuery.isLoading}
              hasActiveFilters={hasActiveFilters}
              onAddJob={() => setAddJobOpen(true)}
            />
          </TourHighlight>
          <div className="flex justify-end border-t border-border px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => setAddJobOpen(true)}>
              <Plus className="size-4" />
              Add Job
            </Button>
          </div>
        </div>
      </div>

      <AddJobDialog open={addJobOpen} onOpenChange={setAddJobOpen} />
    </div>
  );
}

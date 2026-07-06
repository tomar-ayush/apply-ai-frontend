import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { useJobsList } from "@/queries/useJobsQueries";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useAutomationInsights } from "@/features/dashboard/hooks/useAutomationInsights";
import { StatsRow } from "@/features/dashboard/components/StatsRow";
import { AutomationInsightsPanel } from "@/features/dashboard/components/AutomationInsightsPanel";
import { RecentActivePipelinesTable } from "@/features/dashboard/components/RecentActivePipelinesTable";
import { AddJobDialog } from "@/features/jobs/components/AddJobDialog";
import { getErrorMessage } from "@/lib/axios-error";

export function DashboardPage() {
  const [addJobOpen, setAddJobOpen] = useState(false);
  const jobsQuery = useJobsList();
  const jobs = jobsQuery.data?.items;

  const stats = useDashboardStats(jobs);
  const insights = useAutomationInsights(jobs);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        pill="Workspace"
        actions={
          <Button onClick={() => setAddJobOpen(true)}>
            <Plus className="size-4" />
            Add Job
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {jobsQuery.isError && (
          <ErrorBanner
            message={getErrorMessage(jobsQuery.error, "Could not load your jobs.")}
            onRetry={() => jobsQuery.refetch()}
          />
        )}

        <StatsRow stats={stats} isLoading={jobsQuery.isLoading} />

        <AutomationInsightsPanel insights={insights} isLoading={jobsQuery.isLoading} />

        <RecentActivePipelinesTable
          jobs={jobs ?? []}
          isLoading={jobsQuery.isLoading}
          onAddJob={() => setAddJobOpen(true)}
        />
      </div>

      <AddJobDialog open={addJobOpen} onOpenChange={setAddJobOpen} />
    </div>
  );
}

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
  const jobs = jobsQuery.data;

  const stats = useDashboardStats(jobs);
  const insights = useAutomationInsights(jobs);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        pill="Workspace"
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

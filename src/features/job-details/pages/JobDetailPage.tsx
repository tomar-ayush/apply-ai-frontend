import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import { JobDetailSkeleton } from "@/components/shared/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { JobHeader } from "@/features/job-details/components/JobHeader";
import { StatusOverrideControl } from "@/features/job-details/components/StatusOverrideControl";
import { JobTimeline } from "@/features/job-details/components/JobTimeline";
import { JDSummaryPanel } from "@/features/job-details/components/JDSummaryPanel";
import { JDQuestionsPanel } from "@/features/job-details/components/JDQuestionsPanel";
import { ReferralTable } from "@/features/job-details/components/ReferralTable";
import { ResumeSection } from "@/features/job-details/components/ResumeSection";
import { ExtensionStatusCard } from "@/features/job-details/components/ExtensionStatusCard";
// import { WorkdayApplyCard } from "@/features/job-details/components/WorkdayApplyCard";
import { useJob, useJobFromList } from "@/queries/useJobsQueries";
import { JobStatus } from "@/types/enums";
import { useJobJd, useReparseJd } from "@/queries/useJobJdQueries";
import { useJobReferrals } from "@/queries/useReferralsQueries";
import { getErrorMessage } from "@/lib/axios-error";
import { TourHighlight } from "@/components/shared/TourHighlight";

import { DEMO_JOB, DEMO_JD, DEMO_REFERRALS } from "@/lib/demo-data";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // DEMO MODE MOCKS
  const isDemo = id === "demo";

  const jobQuery = useJob(id);
  // GET /jobs/{id} omits company/role/workday_job_id — pull them from the list
  // cache (JobDetailResponse) or fall back to the JD, which still carries them.
  const listJob = useJobFromList(id);
  const jdQuery = useJobJd(jobQuery.data);
  const referralsQuery = useJobReferrals(id);
  const reparse = useReparseJd(id ?? "");

  if (jobQuery.isLoading && !isDemo) {
    return (
      <div>
        <PageHeader title="Job" pill="Workspace" />
        <JobDetailSkeleton />
      </div>
    );
  }

  if (jobQuery.isError && !isDemo) {
    const notFound = isAxiosError(jobQuery.error) && jobQuery.error.response?.status === 404;
    return (
      <div>
        <PageHeader title="Job" pill="Workspace" />
        <EmptyState
          icon={ArrowLeft}
          title={notFound ? "Job not found" : "Could not load this job"}
          description={notFound ? "It may have been deleted, or the link is incorrect." : getErrorMessage(jobQuery.error)}
          action={{ label: "Back to jobs", onClick: () => window.history.back() }}
        />
      </div>
    );
  }

  const job = isDemo ? DEMO_JOB : jobQuery.data;
  if (!job) return null;

  // GET /jobs/{id} omits company/role — prefer the list cache, then the JD.
  const company = isDemo ? DEMO_JD.company : listJob?.company ?? jdQuery.data?.company ?? null;
  const role = isDemo ? DEMO_JD.role : listJob?.role ?? jdQuery.data?.role ?? null;
  const jdData = isDemo ? DEMO_JD : jdQuery.data;
  const referralsData = isDemo ? DEMO_REFERRALS : (referralsQuery.data ?? []);
  const isJdLoading = isDemo ? false : jdQuery.isLoading;
  const isReferralsLoading = isDemo ? false : referralsQuery.isLoading;
  const isReferralsError = isDemo ? false : referralsQuery.isError;


  return (
    <div>
      <PageHeader
        title={role || company || "Job"}
        pill="Workspace"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={reparse.isPending || jobQuery.data?.status === JobStatus.NEW}
              onClick={() =>
                reparse.mutate(undefined, {
                  onSuccess: () => toast.success("Job description re-parsed"),
                  onError: (error) => toast.error(getErrorMessage(error, "Could not re-parse this job description")),
                })
              }
              className="px-2 sm:px-3"
            >
              <Sparkles className={cn("size-3.5 sm:mr-1.5", reparse.isPending && "animate-spin")} />
              <span className="hidden sm:inline">{reparse.isPending ? "Re-parsing…" : "AI Reparse"}</span>
            </Button>
            <Link to="/jobs" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground ml-2">
              ← All jobs
            </Link>
          </div>
        }
      />

      <TourHighlight activePath="/jobs/demo" stepIndex={3}>
        <JobHeader job={job} company={company} role={role} />
      </TourHighlight>
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Status</p>
              <StatusOverrideControl jobId={job.id} status={job.status} referralReceived={job.referral_received} />
            </div>

            <TourHighlight activePath="/jobs/demo" stepIndex={4}>
              <JDSummaryPanel jobStatus={job.status} jd={jdData} isLoading={isJdLoading} />
            </TourHighlight>
            {/* <JDQuestionsPanel jobStatus={job.status} jd={jdData} isLoading={isJdLoading} /> */}
            <TourHighlight activePath="/jobs/demo" stepIndex={5}>
              <JDQuestionsPanel jobStatus={job.status} jd={jdData} isLoading={isJdLoading} />
            </TourHighlight>
          </div>

          <div className="space-y-6">
            <JobTimeline job={job} />
            <div className="hidden sm:block">
              <ExtensionStatusCard />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <TourHighlight activePath="/jobs/demo" stepIndex={6}>
            <ReferralTable jobId={job.id} referrals={referralsData} isLoading={isReferralsLoading} queries={jdData?.extracted_department} company={company} />
          </TourHighlight>
          {isReferralsError && !isDemo && (
              <ErrorBanner message={getErrorMessage(referralsQuery.error, "Could not load referrals.")} onRetry={() => referralsQuery.refetch()} />
            )}
          <TourHighlight activePath="/jobs/demo" stepIndex={7}>
            <ResumeSection jobId={job.id} />
          </TourHighlight>
        </div>
        
      </div>
    </div>
  );
}

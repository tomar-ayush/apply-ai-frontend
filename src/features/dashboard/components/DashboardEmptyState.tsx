import { Link } from "react-router-dom";
import { Plus, User, Puzzle, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface DashboardEmptyStateProps {
  onAddJob: () => void;
}

export function DashboardEmptyState({ onAddJob }: DashboardEmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome to ApplyAI</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Let's get your job search automation up and running. Follow these three steps to set up your profile and start tracking your first application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Step 1 */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">1. Complete your profile</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add your resume details and API keys so we can tailor your application materials.
            </p>
          </div>
          <Link to="/settings" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
            Go to Settings <ArrowRight className="ml-1.5 size-3" />
          </Link>
        </div>

        {/* Step 2 */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Plus className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">2. Add your first job</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste a Workday URL or job posting to create a tailored resume and networking plan.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onAddJob}>
            Add a Job <ArrowRight className="ml-1.5 size-3" />
          </Button>
        </div>

        {/* Step 3 */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Puzzle className="size-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">3. Get the extension</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Install the Chrome extension to automate LinkedIn networking and referrals.
            </p>
          </div>
          <Link to="/extension" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
            Install Extension <ArrowRight className="ml-1.5 size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

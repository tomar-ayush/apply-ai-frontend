import { Bell, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AutomationInsight } from "@/features/dashboard/hooks/useAutomationInsights";

const DOT_CLASS: Record<AutomationInsight["tone"], string> = {
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  info: "bg-blue-500",
};

interface AutomationInsightsPanelProps {
  insights: AutomationInsight[];
  isLoading?: boolean;
}

export function AutomationInsightsPanel({ insights, isLoading }: AutomationInsightsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-amber-400" />
          <p className="text-sm font-medium text-foreground">Automation Insights</p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">Computed live</span>
      </div>

      {isLoading ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">Computing insights…</div>
      ) : insights.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          No action items right now — everything is moving on its own.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", DOT_CLASS[insight.tone])} />
                <p className="text-sm text-foreground/90">{insight.message}</p>
              </div>
              <Link
                to={`/jobs/${insight.jobId}`}
                className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {insight.actionLabel}
                <ChevronRight className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

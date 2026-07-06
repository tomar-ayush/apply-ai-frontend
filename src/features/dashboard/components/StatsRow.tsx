import { Layers, Clock, CircleCheck, ScanLine, MessagesSquare } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";

interface StatsRowProps {
  stats: ReturnType<typeof useDashboardStats>;
  isLoading: boolean;
}

export function StatsRow({ stats, isLoading }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total Applications" value={stats.total} icon={Layers} isLoading={isLoading} />
      <StatCard
        label="Waiting For Referral"
        value={stats.waitingForReferral}
        icon={Clock}
        isLoading={isLoading}
        accentClassName="text-amber-400"
      />
      <StatCard
        label="Applied"
        value={stats.applied}
        icon={CircleCheck}
        isLoading={isLoading}
        accentClassName="text-emerald-400"
      />
      <StatCard label="OA (Online Assess.)" value={stats.oa} icon={ScanLine} isLoading={isLoading} accentClassName="text-blue-400" />
      <StatCard
        label="Interviews"
        value={stats.interviews}
        icon={MessagesSquare}
        isLoading={isLoading}
        accentClassName="text-blue-400"
      />
    </div>
  );
}

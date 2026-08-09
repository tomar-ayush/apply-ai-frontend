import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_STATUS_MAP } from "@/lib/statusMaps";
import { JobStatus } from "@/types/enums";

export type SortOption = "updated_desc" | "company_asc" | "status";

const SORT_LABELS: Record<SortOption, string> = {
  updated_desc: "Newest",
  company_asc: "Company A–Z",
  status: "Status",
};

interface JobsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: JobStatus | "ALL";
  onStatusChange: (value: JobStatus | "ALL") => void;
  company: string | "ALL";
  onCompanyChange: (value: string) => void;
  companies: string[];
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function JobsFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  company,
  onCompanyChange,
  companies,
  sort,
  onSortChange,
}: JobsFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by role, company, or keyword…"
          className="pl-8"
        />
      </div>

      <div className="flex w-full gap-2 overflow-x-auto sm:w-auto sm:overflow-visible">
        <Select value={status} onValueChange={(v) => onStatusChange((v as JobStatus | null) ?? "ALL")}>
          <SelectTrigger className="w-[140px] sm:w-44 shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Status: All</SelectItem>
            {Object.values(JobStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {JOB_STATUS_MAP[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={company} onValueChange={(v) => onCompanyChange(v ?? "ALL")}>
          <SelectTrigger className="w-[130px] sm:w-40 shrink-0">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Company: All</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => onSortChange((v as SortOption | null) ?? "updated_desc")}>
          <SelectTrigger className="w-[130px] sm:w-36 shrink-0">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <SelectItem key={key} value={key}>
                Sort: {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import { shortDate, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface TimelineEntry {
  label: string;
  timestamp: string;
  isCurrent?: boolean;
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="space-y-0">
      {entries.map((entry, index) => (
        <li key={`${entry.label}-${entry.timestamp}`} className="relative flex gap-3 pb-5 last:pb-0">
          {index < entries.length - 1 && (
            <span className="absolute top-3 left-[5px] h-full w-px bg-border" aria-hidden />
          )}
          <span
            className={cn(
              "relative z-10 mt-1 size-[11px] shrink-0 rounded-full border-2 border-background",
              entry.isCurrent ? "bg-blue-500" : "bg-zinc-600"
            )}
          />
          <div className="min-w-0 pb-0.5">
            <p className={cn("text-sm", entry.isCurrent ? "font-medium text-foreground" : "text-foreground/80")}>
              {entry.label}
            </p>
            <p className="font-mono text-xs text-muted-foreground" title={shortDate(entry.timestamp)}>
              {relativeTime(entry.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

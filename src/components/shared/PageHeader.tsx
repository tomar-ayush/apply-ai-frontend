import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  pill?: string;
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function PageHeader({ title, pill, actions, sticky = true, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "z-10 flex items-center justify-between gap-2 md:gap-4 border-b border-border bg-background/95 px-4 py-3 md:px-6 md:py-4 backdrop-blur supports-backdrop-filter:bg-background/80",
        sticky && "sticky top-0",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-base font-medium text-foreground">{title}</h1>
        {pill && (
          <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {pill}
          </span>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

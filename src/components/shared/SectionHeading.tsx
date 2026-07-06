import type { ReactNode } from "react";

interface SectionHeadingProps {
  index: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeading({ index, title, description, actions }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {index}_{title.toUpperCase().replace(/\s+/g, "_")}
        </p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

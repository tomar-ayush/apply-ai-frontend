import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-400 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10">
          Retry
        </Button>
      )}
    </div>
  );
}

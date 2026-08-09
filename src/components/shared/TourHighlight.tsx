import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import { useJobsList } from "@/queries/useJobsQueries";

interface TourHighlightProps {
  children: ReactNode;
  activePath: string;
  stepIndex?: number;
}

export function TourHighlight({ children, activePath, stepIndex }: TourHighlightProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const jobsQuery = useJobsList();
  const highlightRef = useRef<HTMLDivElement>(null);
  
  const isEmpty = jobsQuery.data?.length === 0;
  
  // Determine if this highlight is active
  let isActive = false;
  
  if (isEmpty && location.pathname === activePath) {
    if (stepIndex !== undefined) {
      // If a specific step is required, check the tourStep parameter
      const currentStep = parseInt(params.get("tourStep") || "-1", 10);
      isActive = currentStep === stepIndex;
    } else {
      // Otherwise, just highlight based on path match
      isActive = true;
    }
  }

  useEffect(() => {
    if (isActive && highlightRef.current) {
      // Small timeout ensures layout has finished rendering
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [isActive]);
  
  return (
    <div ref={highlightRef} className={cn("transition-all duration-700", isActive && "relative z-50 rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse")}>
      {children}
    </div>
  );
}

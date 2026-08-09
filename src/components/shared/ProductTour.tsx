import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Settings, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobsList } from "@/queries/useJobsQueries";

const TOUR_STEPS = [
  {
    pathMatch: "/dashboard",
    icon: Sparkles,
    title: "Welcome to ApplyAI",
    description: "Your personal networking and resume automation engine. Let's take a quick tour to get you set up and show you how to streamline your job search. We will guide you through setting up LLM credentials, managing your job pipeline, and generating tailored application assets.",
    buttonText: "Set API Keys",
    nextPath: "/settings",
    position: "center"
  },
  {
    pathMatch: "/settings",
    icon: Settings,
    title: "Set your API Keys",
    description: "ApplyAI uses LLMs to tailor resumes and draft referral messages. Add your API key here to enable the automation engine.",
    buttonText: "Go to Jobs",
    nextPath: "/jobs",
    position: "top-right"
  },
  {
    pathMatch: "/jobs",
    icon: Briefcase,
    title: "Your Pipeline",
    description: "This is your jobs pipeline. We've added a mock job for you to explore.",
    buttonText: "Explore a Job",
    nextPath: "/jobs/demo",
    position: "bottom-right"
  },
  {
    pathMatch: "/jobs/demo",
    icon: FileText,
    title: "The Job Workspace",
    description: "Welcome to the Job Details workspace. Here is where the magic happens.",
    buttonText: "Next",
    nextPath: "/jobs/demo",
    position: "bottom-right"
  },
  {
    pathMatch: "/jobs/demo",
    icon: FileText,
    title: "AI Job Summary",
    description: "We automatically parse the job description to extract the required skills, core responsibilities, and department info.",
    buttonText: "Next",
    nextPath: "/jobs/demo",
    position: "bottom-right"
  },
  {
    pathMatch: "/jobs/demo",
    icon: FileText,
    title: "Application Questions",
    description: "ApplyAI automatically drafts answers to common application questions based on your background and the job requirements.",
    buttonText: "Next",
    nextPath: "/jobs/demo",
    position: "bottom-right"
  },
  {
    pathMatch: "/jobs/demo",
    icon: FileText,
    title: "Networking & Referrals",
    description: "ApplyAI finds employees at the company and drafts personalized LinkedIn connection messages for you.",
    buttonText: "Next",
    nextPath: "/jobs/demo",
    position: "top-right"
  },
  {
    pathMatch: "/jobs/demo",
    icon: FileText,
    title: "Tailored Resume",
    description: "We generate a mathematically optimized LaTeX resume perfectly aligned with the job description.",
    buttonText: "Finish Tour",
    nextPath: "/dashboard",
    position: "bottom-right"
  }
];

export function ProductTour() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const jobsQuery = useJobsList();
  const [isDismissed, setIsDismissed] = useState(false);
  
  const isEmpty = jobsQuery.data?.length === 0;

  // The step is determined by the URL parameter 'tourStep' OR it infers from the path
  let currentStepIndex = parseInt(params.get("tourStep") || "-1", 10);
  
  if (currentStepIndex === -1 || TOUR_STEPS[currentStepIndex]?.pathMatch !== location.pathname) {
    currentStepIndex = TOUR_STEPS.findIndex((s) => location.pathname === s.pathMatch);
  }

  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  const handleNext = () => {
    if (currentStepIndex === -1) return;
    const nextStepIndex = currentStepIndex + 1;
    if (isLast) {
      setIsDismissed(true);
      navigate(step.nextPath);
      return;
    }
    const nextStep = TOUR_STEPS[nextStepIndex];
    if (nextStep.pathMatch === location.pathname) {
      // Just update search param
      navigate(`${location.pathname}?tourStep=${nextStepIndex}`);
    } else {
      // Navigate to new path
      navigate(`${nextStep.pathMatch}?tourStep=${nextStepIndex}`);
    }
  };

  const handlePrev = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex < 0) return;
    const prevStep = TOUR_STEPS[prevStepIndex];
    if (prevStep.pathMatch === location.pathname) {
      navigate(`${location.pathname}?tourStep=${prevStepIndex}`);
    } else {
      navigate(`${prevStep.pathMatch}?tourStep=${prevStepIndex}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    if (isEmpty && !isDismissed && currentStepIndex !== -1) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentStepIndex, isLast, step?.nextPath, location.pathname, isEmpty, isDismissed]);

  // Early return placed unconditionally at the bottom of all hooks
  if (!isEmpty || isDismissed || currentStepIndex === -1) return null;

  const positionClass = step.position === "center" 
    ? "items-center justify-center p-6" 
    : step.position === "top-right" 
    ? "items-start justify-end p-6" 
    : "items-end justify-end p-6";

  return (
    <>
      {/* Spotlight Backdrop */}
      <motion.div
        key="tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[3px] pointer-events-none"
      />

      <div className={`fixed inset-0 z-[100] flex pointer-events-none ${positionClass}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm pointer-events-auto"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-6" />
                </div>
                
                <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <Button variant="ghost" size="icon" className="size-7" onClick={handlePrev}>
                      <ArrowLeft className="size-4" />
                    </Button>
                  )}
                  <div className="flex items-center gap-1.5 ml-2">
                    {TOUR_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentStepIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <Button onClick={handleNext} size="sm" className="gap-1.5">
                  {step.buttonText}
                  {isLast ? <Check className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  <kbd className="ml-1 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-60">
                    ↵
                  </kbd>
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

import { HelpCircle, Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatus } from "@/types/enums";
import type { JobJDResponse } from "@/types/api";

interface JDQuestionsPanelProps {
    jobStatus: JobStatus;
    jd: JobJDResponse | undefined;
    isLoading: boolean;
}

export function JDQuestionsPanel({ jobStatus, jd, isLoading }: JDQuestionsPanelProps) {
    // Single `learning` field: topic -> list of questions to review.
    const learning = jd?.learning ?? {};
    const topics = Object.keys(learning);
    const hasContent = topics.length > 0;

    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">Interview Prep</p>
            </div>

            <div className="space-y-4 p-4">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : jobStatus === JobStatus.NEW || !jd ? (
                    <EmptyState
                        icon={HelpCircle}
                        title="Not parsed yet"
                        description="Questions and topics appear here once the job description is parsed."
                        className="py-8"
                    />
                ) : !hasContent ? (
                    <EmptyState
                        icon={HelpCircle}
                        title="Nothing to prep yet"
                        description="This job description didn't surface any questions or topics."
                        className="py-8"
                    />
                ) : (
                    topics.map((topic) => (
                        <div key={topic}>
                            <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                                <Lightbulb className="size-3.5" />
                                {topic}
                            </p>
                            <ul className="space-y-1.5">
                                {(learning[topic] ?? []).map((item, i) => (
                                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

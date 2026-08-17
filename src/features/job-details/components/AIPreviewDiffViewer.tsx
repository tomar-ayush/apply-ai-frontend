import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFinalizeAi } from "@/queries/useResumeQueries";
import type { PreviewResponse, BulletChange } from "@/types/api";
import { getErrorMessage } from "@/lib/axios-error";
import { cn } from "@/lib/utils";

interface AIPreviewDiffViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewData: PreviewResponse | null;
    jobId: string;
    onSuccess: () => void;
}

export function AIPreviewDiffViewer({
    open,
    onOpenChange,
    previewData,
    jobId,
    onSuccess,
}: AIPreviewDiffViewerProps) {
    const finalizeAi = useFinalizeAi(jobId);
    
    // Track accepted change IDs
    const [accepted, setAccepted] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open && previewData) {
            const allChangeIds = previewData.sections.flatMap(s => s.changes.filter(c => c.change_type !== "unchanged").map(c => c.change_id));
            setAccepted(new Set(allChangeIds));
        }
    }, [open, previewData]);

    const toggleChange = (changeId: string) => {
        setAccepted(prev => {
            const next = new Set(prev);
            if (next.has(changeId)) next.delete(changeId);
            else next.add(changeId);
            return next;
        });
    };

    const handleFinalize = () => {
        if (!previewData) return;
        toast.info("Applying selected changes…");
        finalizeAi.mutate(
            { preview_id: previewData.preview_id, accepted_change_ids: Array.from(accepted) },
            {
                onSuccess: (data) => {
                    toast.success(`Successfully applied ${data.accepted_count} changes!`);
                    onSuccess();
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getErrorMessage(error, "Could not apply AI changes")),
            }
        );
    };

    if (!previewData) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-border">
                            <Sparkles className="size-3.5 text-muted-foreground" />
                        </div>
                        <DialogTitle>Review AI Changes</DialogTitle>
                    </div>
                    <DialogDescription>
                        Select which AI modifications to apply to your resume. Unselected changes will be discarded.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 py-4 px-1">
                    {previewData.sections.map((section) => {
                        const visibleChanges = section.changes.filter(c => c.change_type !== "unchanged");
                        if (visibleChanges.length === 0) return null;
                        
                        return (
                            <div key={section.section_key} className="space-y-3">
                                <h3 className="font-semibold text-sm text-foreground">{section.section_title}</h3>
                                <div className="space-y-3 border-l-2 border-border pl-4">
                                    {visibleChanges.map((change) => (
                                        <BulletChangeItem 
                                            key={change.change_id}
                                            change={change} 
                                            isAccepted={accepted.has(change.change_id)}
                                            onToggle={() => toggleChange(change.change_id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="shrink-0 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={finalizeAi.isPending}>
                        Discard All
                    </Button>
                    <Button onClick={handleFinalize} disabled={finalizeAi.isPending}>
                        <Sparkles className="size-3.5 mr-2" />
                        {finalizeAi.isPending ? "Applying…" : `Apply ${accepted.size} Changes`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BulletChangeItem({ change, isAccepted, onToggle }: { change: BulletChange, isAccepted: boolean, onToggle: () => void }) {
    return (
        <div 
            className={cn(
                "rounded-lg border p-3 cursor-pointer transition-colors",
                isAccepted ? "border-primary/50 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
            )}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3">
                <Checkbox checked={isAccepted} className="mt-1" />
                <div className="flex-1 space-y-2 text-sm font-mono text-[13px] leading-relaxed">
                    {change.change_type === "removed" && (
                        <div className="text-destructive line-through opacity-70 bg-destructive/10 px-2 py-1 rounded">
                            {change.original_text}
                        </div>
                    )}
                    {change.change_type === "added" && (
                        <div className="text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                            {change.optimized_text}
                        </div>
                    )}
                    {change.change_type === "modified" && (
                        <>
                            <div className="text-destructive line-through opacity-70 bg-destructive/10 px-2 py-1 rounded">
                                {change.original_text}
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                                {change.optimized_text}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

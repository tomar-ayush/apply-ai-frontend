import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Plus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RESUME_SECTIONS, type ResumeSection } from "@/types/enums";
import { cn } from "@/lib/utils";

interface GenerateResumeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (sections: ResumeSection[], extraKeywords: string[]) => void;
    isPending: boolean;
    missingKeywords?: string[] | null;
}

export function GenerateResumeDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    missingKeywords,
}: GenerateResumeDialogProps) {
    const [selected, setSelected] = useState<ResumeSection[]>(RESUME_SECTIONS.map((s) => s.value));
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open && missingKeywords) {
            // Select all by default when opened
            setSelectedKeywords(new Set(missingKeywords));
        } else if (!open) {
            setSelectedKeywords(new Set());
        }
    }, [open, missingKeywords]);

    const toggleSection = (value: ResumeSection) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords((prev) => {
            const next = new Set(prev);
            if (next.has(keyword)) next.delete(keyword);
            else next.add(keyword);
            return next;
        });
    };

    const handleConfirm = () => {
        if (!selected.length) {
            toast.error("Select at least one section to optimize");
            return;
        }
        onConfirm(selected, Array.from(selectedKeywords));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-border">
                            <Sparkles className="size-3.5 text-muted-foreground" />
                        </div>
                        <DialogTitle>Optimize resume</DialogTitle>
                    </div>
                    <DialogDescription>
                        Choose which sections to tailor for this job and which keywords to inject.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {missingKeywords && missingKeywords.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Targeted Keywords</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                We found these keywords in the JD that are missing from your profile.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.map((kw) => {
                                    const isSelected = selectedKeywords.has(kw);
                                    return (
                                        <Badge
                                            key={kw}
                                            variant={isSelected ? "default" : "outline"}
                                            className={cn("cursor-pointer select-none", !isSelected && "text-muted-foreground")}
                                            onClick={() => toggleKeyword(kw)}
                                        >
                                            {kw}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-border/50">
                        <p className="text-sm font-medium text-foreground mb-3">Sections to Optimize</p>
                        {RESUME_SECTIONS.map((section) => (
                            <label
                                key={section.value}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/40"
                            >
                                <Checkbox
                                    checked={selected.includes(section.value)}
                                    onCheckedChange={() => toggleSection(section.value)}
                                />
                                <span>{section.label}</span>
                                {section.recommended && (
                                    <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600">
                                        Recommended
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isPending}>
                        <Sparkles className="size-3.5" />
                        {isPending ? "Generating Preview…" : "Generate Preview"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

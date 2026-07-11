import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

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
import { RESUME_SECTIONS, type ResumeSection } from "@/types/enums";

interface GenerateResumeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (sections: ResumeSection[]) => void;
    isPending: boolean;
}

export function GenerateResumeDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
}: GenerateResumeDialogProps) {
    const [selected, setSelected] = useState<ResumeSection[]>(RESUME_SECTIONS.map((s) => s.value));

    const toggle = (value: ResumeSection) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleConfirm = () => {
        if (!selected.length) {
            toast.error("Select at least one section to optimize");
            return;
        }
        onConfirm(selected);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-border">
                            <Sparkles className="size-3.5 text-muted-foreground" />
                        </div>
                        <DialogTitle>Optimize resume</DialogTitle>
                    </div>
                    <DialogDescription>
                        Choose which sections to tailor for this job. The AI resume is generated from these.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-1">
                    {RESUME_SECTIONS.map((section) => (
                        <label
                            key={section.value}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/40"
                        >
                            <Checkbox
                                checked={selected.includes(section.value)}
                                onCheckedChange={() => toggle(section.value)}
                            />
                            {section.label}
                        </label>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isPending}>
                        <Sparkles className="size-3.5" />
                        {isPending ? "Optimizing…" : "Generate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

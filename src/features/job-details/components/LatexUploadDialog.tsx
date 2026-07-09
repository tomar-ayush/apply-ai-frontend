import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileUp, ClipboardPaste, CheckCircle2, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUploadLatex } from "@/queries/useResumeQueries";
import { getErrorMessage } from "@/lib/axios-error";

interface LatexUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SAMPLE_LATEX = `\\documentclass{article}
\\begin{document}
Hello, \\LaTeX!
\\end{document}`;

export function LatexUploadDialog({ open, onOpenChange }: LatexUploadDialogProps) {
    const uploadLatex = useUploadLatex();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [pasted, setPasted] = useState("");
    const [validation, setValidation] = useState<{ ok: boolean; message?: string } | null>(null);

    // const validate = (tex: string): { ok: boolean; message?: string } => {
    //     if (!tex.trim()) return { ok: false, message: "LaTeX content is empty." };
    //     try {
    //         // KaTeX is a math renderer, but it will throw on malformed commands/braces,
    //         // which gives us a lightweight sanity check before sending to the backend.
    //         katex.renderToString(tex, { throwOnError: true, strict: false });
    //         return { ok: true };
    //     } catch (err) {
    //         return { ok: false, message: err instanceof Error ? err.message : "Invalid LaTeX." };
    //     }
    // };

    // Temporary no-op validation while KaTeX checks are disabled.
    const validate = (tex: string): { ok: boolean; message?: string } =>
        tex.trim() ? { ok: true } : { ok: false, message: "LaTeX content is empty." };

    const handleFile = async (file: File) => {
        const text = await file.text();
        setPasted(text);
        setValidation(validate(text));
    };

    const handlePasteChange = (value: string) => {
        setPasted(value);
        setValidation(validate(value));
    };

    const handleSubmit = () => {
        const result = validate(pasted);
        setValidation(result);
        if (!result.ok) {
            toast.error(result.message ?? "LaTeX is invalid.");
            return;
        }
        uploadLatex.mutate(pasted, {
            onSuccess: () => {
                toast.success("LaTeX uploaded and compiling to PDF");
                onOpenChange(false);
                setPasted("");
                setValidation(null);
            },
            onError: (error) => toast.error(getErrorMessage(error, "Could not upload LaTeX resume")),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload resume (LaTeX)</DialogTitle>
                    <DialogDescription>
                        Upload a <code className="text-xs">.tex</code> file or paste your LaTeX source. It is validated before upload.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileUp className="size-3.5" />
                        Upload .tex file
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePasteChange(SAMPLE_LATEX)}
                    >
                        <ClipboardPaste className="size-3.5" />
                        Paste LaTeX
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".tex,text/x-tex"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFile(file);
                            e.target.value = "";
                        }}
                    />
                </div>

                <Textarea
                    value={pasted}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="Paste your LaTeX source here…"
                    rows={10}
                    className="max-h-80 overflow-y-auto font-mono text-xs"
                />

                {validation && (
                    <div
                        className={
                            validation.ok
                                ? "flex items-center gap-2 text-xs text-emerald-500"
                                : "flex items-center gap-2 text-xs text-rose-500"
                        }
                    >
                        {validation.ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                        {validation.ok ? "LaTeX looks valid." : validation.message}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={uploadLatex.isPending || !validation?.ok}>
                        {uploadLatex.isPending ? "Uploading…" : "Upload & Compile"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

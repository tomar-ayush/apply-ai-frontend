import { useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LLMProvider } from "@/types/enums";
import { LLM_PROVIDER_KEY_FIELD, type SettingsFormValues } from "@/features/settings/schemas";

const PROVIDER_LABELS: Record<string, string> = {
  [LLMProvider.ANTHROPIC]: "Anthropic Claude",
  [LLMProvider.OPENAI]: "OpenAI GPT",
  [LLMProvider.GEMINI]: "Google Gemini",
  [LLMProvider.OPENROUTER]: "OpenRouter",
};

const PROVIDERS = [LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GEMINI, LLMProvider.OPENROUTER] as const;

function CopyableSpan({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <span
      onClick={handleCopy}
      title="Click to copy"
      className="inline-flex cursor-pointer items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95"
    >
      {text}
    </span>
  );
}

function MaskedKeyInput({
  id,
  placeholder,
  register,
}: {
  id: string;
  placeholder: string;
  register: ReturnType<UseFormReturn<SettingsFormValues>["register"]>;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} placeholder={placeholder} className="pr-9" {...register} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

interface LLMSettingsSectionProps {
  form: UseFormReturn<SettingsFormValues>;
  /** Per-provider "configured" state from the backend's has_*_key presence flags. */
  hasKeyByProvider: Record<LLMProvider, boolean>;
}

export function LLMSettingsSection({ form, hasKeyByProvider }: LLMSettingsSectionProps) {
  const { register, control, watch, setValue } = form;
  const selectedProvider = watch("llm_provider");

  useEffect(() => {
    setValue("current_llm_model", "");
  }, [selectedProvider, setValue]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="03"
        title="AI / LLM Settings"
        description="Configure API credentials securely. Keys are encrypted and hidden after saving."
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Field className="sm:w-64">
            <FieldLabel htmlFor="llm_provider">Active provider</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="llm_provider"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                    <SelectTrigger id="llm_provider" className="w-full">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {PROVIDER_LABELS[provider]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
          </Field>

          <Field className="sm:w-56">
            <FieldLabel htmlFor="current_llm_model">
              Model
              {selectedProvider === LLMProvider.OPENROUTER && <span className="ml-1 text-rose-400">*</span>}
            </FieldLabel>
            <FieldContent>
              <Input
                id="current_llm_model"
                placeholder={selectedProvider === LLMProvider.OPENROUTER ? "Required" : "Optional"}
                {...register("current_llm_model")}
              />
            </FieldContent>
          </Field>
        </div>

        {selectedProvider === LLMProvider.OPENROUTER && (
          <p className="-mt-2 text-xs text-muted-foreground sm:pl-[17rem]">
            OpenRouter requires a model. Use any slug from <CopyableSpan text="openrouter.ai/models" />
          </p>
        )}
        {selectedProvider === LLMProvider.GEMINI && (
          <p className="-mt-2 text-xs text-muted-foreground sm:pl-[17rem]">
            Gemini requires a model. Use any slug from <CopyableSpan text="https://ai.google.dev/gemini-api/docs/pricing" />
          </p>
        )}

        {/* 
        <div className="flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            It is always better to provide model for the selected LLM provider.
          </span>
        </div>
         */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const fieldName = LLM_PROVIDER_KEY_FIELD[provider];
            const isSelected = selectedProvider === provider;
            const hasSavedKey = hasKeyByProvider[provider];
            return (
              <Field key={provider}>
                <FieldLabel htmlFor={fieldName}>
                  {PROVIDER_LABELS[provider]} API key
                  {hasSavedKey && (
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400 uppercase">
                      Configured
                    </span>
                  )}
                  {isSelected && (
                    <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-blue-400 uppercase">
                      Active
                    </span>
                  )}
                </FieldLabel>
                <FieldContent>
                  <MaskedKeyInput
                    id={fieldName}
                    placeholder={hasSavedKey ? "•••••••••••••••••••• (key set)" : "Paste your API key"}
                    register={register(fieldName)}
                  />
                </FieldContent>
              </Field>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Info } from "lucide-react";

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
  hasLlmApiKey: boolean;
  /** Provider currently persisted on the server — only this one can have a saved key. */
  savedProvider: string | null;
}

export function LLMSettingsSection({ form, hasLlmApiKey, savedProvider }: LLMSettingsSectionProps) {
  const { register, control, watch } = form;
  const selectedProvider = watch("llm_provider");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="04"
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
            OpenRouter requires a model. Use any slug from{" "}
            <span className="font-mono">openrouter.ai/models</span>.
          </p>
        )}

        <div className="flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            You can fill in keys for multiple providers below, but only the key for the active provider above is
            saved and used by automation — the backend stores one active key at a time.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const fieldName = LLM_PROVIDER_KEY_FIELD[provider];
            const isSelected = selectedProvider === provider;
            const hasSavedKey = isSelected && savedProvider === provider && hasLlmApiKey;
            return (
              <Field key={provider}>
                <FieldLabel htmlFor={fieldName}>
                  {PROVIDER_LABELS[provider]} API key
                  {isSelected && (
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400 uppercase">
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

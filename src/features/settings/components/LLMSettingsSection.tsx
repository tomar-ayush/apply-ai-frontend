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
};

const PROVIDERS = [LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GEMINI] as const;

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
  hasGoogleSearchApiKey: boolean;
  /** Provider currently persisted on the server — only this one can have a saved key. */
  savedProvider: string | null;
}

export function LLMSettingsSection({ form, hasLlmApiKey, hasGoogleSearchApiKey, savedProvider }: LLMSettingsSectionProps) {
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
        <Field>
          <FieldLabel htmlFor="llm_provider">Active provider</FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="llm_provider"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || undefined)}>
                  <SelectTrigger id="llm_provider" className="w-full sm:w-64">
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

          <Field>
            <FieldLabel htmlFor="google_search_api_key">Google Search API key</FieldLabel>
            <FieldContent>
              <MaskedKeyInput
                id="google_search_api_key"
                placeholder={hasGoogleSearchApiKey ? "•••••••••••••••••••• (key set)" : "Optional, used for referral search"}
                register={register("google_search_api_key")}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="google_search_engine_id">Google Search engine ID</FieldLabel>
            <FieldContent>
              <Input id="google_search_engine_id" placeholder="Optional" {...register("google_search_engine_id")} />
            </FieldContent>
          </Field>
        </div>
      </div>
    </div>
  );
}

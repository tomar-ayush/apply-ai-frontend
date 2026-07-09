import { z } from "zod";
import { LLMProvider } from "@/types/enums";

const optionalString = z.string().optional().or(z.literal(""));

export const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: optionalString,
});

export const workdayProfileSchema = z.object({
  first_name: optionalString,
  middle_name: optionalString,
  last_name: optionalString,
  address: optionalString,
  country: optionalString,
  city: optionalString,
  state: optionalString,
  postal_code: optionalString,
  current_company: optionalString,
  current_title: optionalString,
  years_of_experience: z.coerce.number().int().min(0).max(60).optional().or(z.literal("" as unknown as number)),
  skills: z.array(z.string()).default([]),
  education: z
    .array(
      z.object({
        school: z.string().min(1, "School is required"),
        degree: optionalString,
        year: optionalString,
      })
    )
    .default([]),
});

export const llmSettingsSchema = z
  .object({
    llm_provider: z.enum([LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GEMINI, LLMProvider.OPENROUTER]).optional(),
    // One input per provider so keys can be entered side by side without switching a dropdown.
    // The backend only persists a single active provider + key pair (see llm_provider above),
    // so only the field matching the selected active provider is actually sent on save.
    openai_api_key: optionalString,
    anthropic_api_key: optionalString,
    gemini_api_key: optionalString,
    openrouter_api_key: optionalString,
    // Model is required for OpenRouter (users pick their own model); optional for the
    // first-party providers which default server-side.
    current_llm_model: optionalString,
  })
  .superRefine((val, ctx) => {
    if (val.llm_provider === LLMProvider.OPENROUTER && !val.current_llm_model?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["current_llm_model"],
        message: "Model is required when using OpenRouter.",
      });
    }
  });

/** Maps an LLM provider to the form field holding its API key. */
export const LLM_PROVIDER_KEY_FIELD = {
  [LLMProvider.OPENAI]: "openai_api_key",
  [LLMProvider.ANTHROPIC]: "anthropic_api_key",
  [LLMProvider.GEMINI]: "gemini_api_key",
  [LLMProvider.OPENROUTER]: "openrouter_api_key",
} as const;

export const settingsFormSchema = z.object({
  ...profileSchema.shape,
  ...workdayProfileSchema.shape,
  ...llmSettingsSchema.shape,
});
// RHF field values track raw input (pre-parse) shape — use z.input so fields with
// `.default()` (skills, education) aren't narrowed to required by the parsed output type.
export type SettingsFormValues = z.input<typeof settingsFormSchema>;

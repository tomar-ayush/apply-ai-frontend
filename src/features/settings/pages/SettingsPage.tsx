import { useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { useMe, useUpdateProfile } from "@/queries/useUsersQueries";
import { LLM_PROVIDER_KEY_FIELD, settingsFormSchema, type SettingsFormValues } from "@/features/settings/schemas";
import { ProfileSection } from "@/features/settings/components/ProfileSection";
import { WorkdayProfileSection } from "@/features/settings/components/WorkdayProfileSection";
import { LLMSettingsSection } from "@/features/settings/components/LLMSettingsSection";
import { ResumeManagerSection } from "@/features/settings/components/ResumeManagerSection";
import { AgentStatusSection } from "@/features/settings/components/AgentStatusSection";
import { getErrorMessage } from "@/lib/axios-error";
import type { UserProfile } from "@/types/api";

function buildDefaultValues(user: UserProfile): SettingsFormValues {
  const skillsList = Array.isArray(user.skills?.list) ? (user.skills!.list as string[]) : [];
  const educationEntries = Array.isArray(user.education?.entries)
    ? (user.education!.entries as { school: string; degree?: string; year?: string }[])
    : [];

  return {
    full_name: user.full_name ?? "",
    phone: user.phone ?? "",
    first_name: user.first_name ?? "",
    middle_name: user.middle_name ?? "",
    last_name: user.last_name ?? "",
    address: user.address ?? "",
    country: user.country ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    postal_code: user.postal_code ?? "",
    current_company: user.current_company ?? "",
    current_title: user.current_title ?? "",
    years_of_experience: user.years_of_experience ?? undefined,
    skills: skillsList,
    education: educationEntries,
    llm_provider: (user.llm_provider as SettingsFormValues["llm_provider"]) ?? undefined,
    openai_api_key: "",
    anthropic_api_key: "",
    gemini_api_key: "",
    openrouter_api_key: "",
    current_llm_model: user.current_llm_model ?? "",
  };
}

export function SettingsPage() {
  const meQuery = useMe();
  const updateProfile = useUpdateProfile();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      skills: [],
      education: [],
    },
  });

  useEffect(() => {
    if (meQuery.data) {
      form.reset(buildDefaultValues(meQuery.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meQuery.data]);

  const onSubmit = form.handleSubmit((values) => {
    const payload: Record<string, unknown> = {
      full_name: values.full_name,
      phone: values.phone || undefined,
      first_name: values.first_name || undefined,
      middle_name: values.middle_name || undefined,
      last_name: values.last_name || undefined,
      address: values.address || undefined,
      country: values.country || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      postal_code: values.postal_code || undefined,
      current_company: values.current_company || undefined,
      current_title: values.current_title || undefined,
      years_of_experience:
        values.years_of_experience === ("" as unknown) || values.years_of_experience === undefined
          ? undefined
          : Number(values.years_of_experience),
      skills: { list: values.skills },
      education: { entries: values.education },
      llm_provider: values.llm_provider || undefined,
    };

    // The backend only stores one active provider + key pair, so only the key field
    // matching the currently selected active provider is sent.
    const activeKeyField = values.llm_provider ? LLM_PROVIDER_KEY_FIELD[values.llm_provider] : undefined;
    const activeKey = activeKeyField ? values[activeKeyField] : undefined;
    if (activeKey) payload.llm_api_key = activeKey;
    // Explicitly send null when no model is provided so the backend clears any prior value.
    payload.current_llm_model = values.current_llm_model?.trim() ? values.current_llm_model.trim() : null;

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Settings saved");
        form.setValue("openai_api_key", "");
        form.setValue("anthropic_api_key", "");
        form.setValue("gemini_api_key", "");
        form.setValue("openrouter_api_key", "");
      },
      onError: (error) => toast.error(getErrorMessage(error, "Could not save settings")),
    });
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        pill="Profile & Resume"
        actions={
          <Button onClick={onSubmit} disabled={updateProfile.isPending || meQuery.isLoading}>
            {updateProfile.isPending ? "Saving…" : "Save Settings"}
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {meQuery.isError && (
          <ErrorBanner message={getErrorMessage(meQuery.error, "Could not load your profile.")} onRetry={() => meQuery.refetch()} />
        )}

        {meQuery.data && (
          <form onSubmit={onSubmit} className="space-y-6">
            <ProfileSection form={form} email={meQuery.data.email} />
            <ResumeManagerSection />
            <WorkdayProfileSection form={form} />
            <LLMSettingsSection
              form={form}
              hasLlmApiKey={meQuery.data.has_llm_api_key}
              savedProvider={meQuery.data.llm_provider}
            />
            <AgentStatusSection />
          </form>
        )}
      </div>
    </div>
  );
}

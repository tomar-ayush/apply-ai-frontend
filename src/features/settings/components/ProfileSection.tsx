import type { UseFormReturn } from "react-hook-form";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import type { SettingsFormValues } from "@/features/settings/schemas";

interface ProfileSectionProps {
  form: UseFormReturn<SettingsFormValues>;
  email: string;
}

export function ProfileSection({ form, email }: ProfileSectionProps) {
  const { register, formState } = form;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading index="01" title="Profile" description="Primary contact info used for communications and notification routing." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <FieldContent>
            <Input id="full_name" {...register("full_name")} />
            <FieldError errors={[formState.errors.full_name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <FieldContent>
            <Input id="email" value={email} disabled readOnly />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone number</FieldLabel>
          <FieldContent>
            <Input id="phone" placeholder="+1 (555) 019-2834" {...register("phone")} />
            <FieldError errors={[formState.errors.phone]} />
          </FieldContent>
        </Field>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { Plus, X } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import type { SettingsFormValues } from "@/features/settings/schemas";

function SkillsInput({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  const [draft, setDraft] = useState("");

  return (
    <Controller
      control={form.control}
      name="skills"
      render={({ field }) => {
        const skills = field.value ?? [];
        const addSkill = () => {
          const value = draft.trim();
          if (value && !skills.includes(value)) {
            field.onChange([...skills, value]);
          }
          setDraft("");
        };
        return (
          <div>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-input p-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => field.onChange(skills.filter((s) => s !== skill))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                onBlur={addSkill}
                placeholder={skills.length ? "" : "Type a skill and press Enter…"}
                className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        );
      }}
    />
  );
}

function EducationList({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "education" });

  return (
    <div className="space-y-3">
      {fields.map((entry, index) => (
        <div key={entry.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
          <Input placeholder="School" {...form.register(`education.${index}.school`)} />
          <Input placeholder="Degree" {...form.register(`education.${index}.degree`)} />
          <Input placeholder="Year" {...form.register(`education.${index}.year`)} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ school: "", degree: "", year: "" })}
      >
        <Plus className="size-3.5" />
        Add education
      </Button>
    </div>
  );
}

export function WorkdayProfileSection({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  const { register, formState } = form;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <SectionHeading
        index="03"
        title="Workday Automation Profile"
        description="Reusable application data fed directly into Playwright autofill scripts."
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="first_name">First name</FieldLabel>
            <FieldContent>
              <Input id="first_name" {...register("first_name")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="middle_name">Middle name</FieldLabel>
            <FieldContent>
              <Input id="middle_name" placeholder="Optional" {...register("middle_name")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="last_name">Last name</FieldLabel>
            <FieldContent>
              <Input id="last_name" {...register("last_name")} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <FieldContent>
              <Input id="address" {...register("address")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <FieldContent>
              <Input id="country" {...register("country")} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <FieldContent>
              <Input id="city" {...register("city")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <FieldContent>
              <Input id="state" {...register("state")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="postal_code">Postal code</FieldLabel>
            <FieldContent>
              <Input id="postal_code" {...register("postal_code")} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="current_company">Current company</FieldLabel>
            <FieldContent>
              <Input id="current_company" {...register("current_company")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="current_title">Current title</FieldLabel>
            <FieldContent>
              <Input id="current_title" {...register("current_title")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="years_of_experience">Experience (years)</FieldLabel>
            <FieldContent>
              <Input id="years_of_experience" type="number" min={0} max={60} {...register("years_of_experience")} />
              <FieldError errors={[formState.errors.years_of_experience]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Skills</FieldLabel>
          <FieldContent>
            <SkillsInput form={form} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Education</FieldLabel>
          <FieldContent>
            <EducationList form={form} />
          </FieldContent>
        </Field>
      </div>
    </div>
  );
}

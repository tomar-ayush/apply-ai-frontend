import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRegister } from "@/queries/useAuthMutations";
import { getErrorMessage } from "@/lib/axios-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";

export function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    registerMutation.mutate(
      { email: values.email, password: values.password, full_name: values.full_name },
      {
        onSuccess: (data) => {
          auth.login(data.access_token);
          navigate("/", { replace: true });
        },
        onError: (error) => setFormError(getErrorMessage(error, "Could not create your account.")),
      }
    );
  });

  return (
    <AuthLayout
      title="Create your ApplyAI account"
      description="Set up your profile once, automate every application after."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <FieldContent>
            <Input
              id="full_name"
              autoComplete="name"
              placeholder="Alex Rivera"
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
            <FieldError errors={[errors.full_name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <FieldContent>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </FieldContent>
        </Field>

        <Button type="submit" className="mt-2 w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

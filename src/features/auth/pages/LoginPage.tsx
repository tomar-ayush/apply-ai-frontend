import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogin } from "@/queries/useAuthMutations";
import { getErrorMessage } from "@/lib/axios-error";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        auth.login(data.access_token);
        const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
        navigate(redirectTo, { replace: true });
      },
      onError: (error) => setFormError(getErrorMessage(error, "Invalid email or password.")),
    });
  });

  return (
    <AuthLayout
      title="Sign in to ApplyAI"
      description="Track applications, referrals, and automation in one place."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Create one
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
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </FieldContent>
        </Field>

        <Button type="submit" className="mt-2 w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}

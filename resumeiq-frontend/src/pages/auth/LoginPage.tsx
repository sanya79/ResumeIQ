import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";
import { SuccessCheck } from "@/features/auth/components/SuccessCheck";
import { useLoginMutation } from "@/features/auth/hooks";
import { validateEmail, validateLoginPassword } from "@/features/auth/validation";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const [form, setForm] = useState<FormState>({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateField(field: keyof FormErrors, value: string) {
    const message = field === "email" ? validateEmail(value) : validateLoginPassword(value);
    setErrors((prev) => ({ ...prev, [field]: message }));
    return message;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailError = validateField("email", form.email);
    const passwordError = validateField("password", form.password);
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    try {
      await loginMutation.mutateAsync({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      setTimeout(() => navigate(redirectTo, { replace: true }), 900);
    } catch {
      // Error surfaced via loginMutation.error below — nothing else to do here.
    }
  }

  if (loginMutation.isSuccess) {
    return (
      <AuthCard>
        <SuccessCheck label="Welcome back — redirecting..." />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7 text-center">
        <h1 className="text-fluid-xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-foreground-secondary">Log in to continue to ResumeIQ.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          icon={<Mail size={15} />}
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            if (touched.email) validateField("email", e.target.value);
          }}
          onBlur={(e) => {
            setTouched((t) => ({ ...t, email: true }));
            validateField("email", e.target.value);
          }}
          error={touched.email ? errors.email : undefined}
          autoComplete="email"
        />

        <div>
          <PasswordInput
            value={form.password}
            onChange={(e) => {
              setForm((f) => ({ ...f, password: e.target.value }));
              if (touched.password) validateField("password", e.target.value);
            }}
            onBlur={(e) => {
              setTouched((t) => ({ ...t, password: true }));
              validateField("password", e.target.value);
            }}
            error={touched.password ? errors.password : undefined}
            autoComplete="current-password"
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-foreground-secondary">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm((f) => ({ ...f, rememberMe: e.target.checked }))}
                className="h-3.5 w-3.5 rounded border-surface-border bg-white/[0.04] accent-accent-purple"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs text-accent-cyan hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {loginMutation.isError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {loginMutation.error instanceof Error ? loginMutation.error.message : "Couldn't log in. Please try again."}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" variant="gradient" size="lg" disabled={loginMutation.isPending} className="mt-1">
          {loginMutation.isPending ? (
            <LoadingSpinner size={16} label="Logging in..." />
          ) : (
            <>
              <LogIn size={16} />
              Log in
            </>
          )}
        </Button>
      </form>

      <SocialAuthButtons />

      <p className="mt-7 text-center text-sm text-foreground-secondary">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-foreground hover:text-accent-cyan transition-colors">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

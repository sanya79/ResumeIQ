import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";
import { SuccessCheck } from "@/features/auth/components/SuccessCheck";
import { useRegisterMutation } from "@/features/auth/hooks";
import { validateConfirmPassword, validateEmail, validateName, validateNewPassword } from "@/features/auth/validation";
import { useToast } from "@/hooks/useToast";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "Candidate" | "Recruiter" | "Admin";
  acceptTerms: boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } } }).response;
    if (typeof response?.data?.message === "string" && response.data.message.trim()) {
      return response.data.message;
    }
    if (Array.isArray(response?.data?.errors)) {
      const joined = response.data.errors.map((item) => item?.message).filter(Boolean).join(" \n");
      if (joined) return joined;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const toast = useToast();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Candidate",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateAll(next: FormState): FieldErrors {
    return {
      name: validateName(next.name),
      email: validateEmail(next.email),
      password: validateNewPassword(next.password),
      confirmPassword: validateConfirmPassword(next.password, next.confirmPassword),
      acceptTerms: next.acceptTerms ? undefined : "You must accept the terms to continue.",
    };
  }

  function validateOne(field: keyof FormState, next: FormState) {
    const all = validateAll(next);
    setErrors((prev) => ({ ...prev, [field]: all[field] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true, acceptTerms: true });
    if (Object.values(allErrors).some(Boolean)) return;

    try {
      await registerMutation.mutateAsync({ name: form.name, email: form.email, password: form.password, role: form.role.toLowerCase() as "candidate" | "recruiter" | "admin" });
      setTimeout(() => navigate("/verify-email", { replace: true }), 900);
    } catch (error) {
      const message = getAuthErrorMessage(error, "Couldn't create your account.");
      toast.error("Account creation failed", message);
    }
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) validateOne(field, next);
    if (field === "password" && touched.confirmPassword) validateOne("confirmPassword", next);
  }

  if (registerMutation.isSuccess) {
    return (
      <AuthCard>
        <SuccessCheck label="Account created — let's verify your email..." />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7 text-center">
        <h1 className="text-fluid-xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-foreground-secondary">Start analyzing your resume with AI.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Full name"
          icon={<User size={15} />}
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, name: true }));
            validateOne("name", form);
          }}
          error={touched.name ? errors.name : undefined}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          icon={<Mail size={15} />}
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            validateOne("email", form);
          }}
          error={touched.email ? errors.email : undefined}
          autoComplete="email"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground-secondary">Account role</label>
          <select
            value={form.role}
            onChange={(e) => updateField("role", e.target.value as FormState["role"])}
            className="h-11 w-full rounded-xl border border-surface-border bg-white/[0.04] px-3 text-sm text-foreground outline-none transition-colors focus:border-accent-purple/60"
          >
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
          <p className="mt-1.5 text-xs text-foreground-secondary">Choose the role that best describes how you’ll use ResumeIQ.</p>
        </div>

        <div>
          <PasswordInput
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            onBlur={() => {
              setTouched((t) => ({ ...t, password: true }));
              validateOne("password", form);
            }}
            error={touched.password ? errors.password : undefined}
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <PasswordInput
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          onBlur={() => {
            setTouched((t) => ({ ...t, confirmPassword: true }));
            validateOne("confirmPassword", form);
          }}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          autoComplete="new-password"
        />

        <div>
          <label className="flex items-start gap-2.5 text-xs text-foreground-secondary">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => updateField("acceptTerms", e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-surface-border bg-white/[0.04] accent-accent-purple"
            />
            <span>
              I agree to the <a href="#" className="text-accent-cyan hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-accent-cyan hover:underline">Privacy Policy</a>.
            </span>
          </label>
          {touched.acceptTerms && errors.acceptTerms && (
            <p className="mt-1.5 text-xs text-danger">{errors.acceptTerms}</p>
          )}
        </div>

        <AnimatePresence>
          {registerMutation.isError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {(() => {
                return getAuthErrorMessage(registerMutation.error, "Couldn't create your account.");
              })()}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" variant="gradient" size="lg" disabled={registerMutation.isPending} className="mt-1">
          {registerMutation.isPending ? (
            <LoadingSpinner size={16} label="Creating account..." />
          ) : (
            <>
              <UserPlus size={16} />
              Create account
            </>
          )}
        </Button>
      </form>

      <SocialAuthButtons />

      <p className="mt-7 text-center text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-foreground hover:text-accent-cyan transition-colors">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { SuccessCheck } from "@/features/auth/components/SuccessCheck";
import { useResetPasswordMutation } from "@/features/auth/hooks";
import { validateConfirmPassword, validateNewPassword } from "@/features/auth/validation";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const mutation = useResetPasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});

  function validate(nextPassword: string, nextConfirm: string) {
    const next = {
      password: validateNewPassword(nextPassword),
      confirmPassword: validateConfirmPassword(nextPassword, nextConfirm),
    };
    setErrors(next);
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validate(password, confirmPassword);
    setTouched({ password: true, confirmPassword: true });
    if (validation.password || validation.confirmPassword) return;

    try {
      await mutation.mutateAsync({ token, password });
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch {
      // Error surfaced via mutation.error below.
    }
  }

  if (!token) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
            <KeyRound size={24} />
          </div>
          <h1 className="text-fluid-lg font-bold tracking-tight">Invalid or expired link</h1>
          <p className="max-w-xs text-sm text-foreground-secondary">
            This password reset link is missing or no longer valid. Request a new one to continue.
          </p>
          <Link to="/forgot-password">
            <Button variant="secondary" size="md" className="mt-2">
              Request a new link
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (mutation.isSuccess) {
    return (
      <AuthCard>
        <SuccessCheck label="Password updated — redirecting to login..." />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7 text-center">
        <h1 className="text-fluid-xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-foreground-secondary">Make it something you haven't used before.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <PasswordInput
            label="New password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) validate(e.target.value, confirmPassword);
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, password: true }));
              validate(password, confirmPassword);
            }}
            error={touched.password ? errors.password : undefined}
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (touched.confirmPassword) validate(password, e.target.value);
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, confirmPassword: true }));
            validate(password, confirmPassword);
          }}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          autoComplete="new-password"
        />

        <AnimatePresence>
          {mutation.isError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {mutation.error instanceof Error ? mutation.error.message : "Couldn't reset your password. The link may have expired."}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" variant="gradient" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? <LoadingSpinner size={16} label="Resetting..." /> : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  );
}

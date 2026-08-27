import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams, type Location } from "react-router-dom";
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
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";

import { STORAGE_KEYS } from "@/utils/constants";
import { resendVerificationEmail, devVerifyAccount } from "@/services/auth.api";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { message?: string; error?: string; errors?: Array<{ message?: string; msg?: string }> } } }).response;
    if (Array.isArray(response?.data?.errors) && response.data.errors.length > 0) {
      const joined = response.data.errors.map((item) => item?.message || item?.msg).filter(Boolean).join(". ");
      if (joined) return joined;
    }
    if (typeof response?.data?.message === "string" && response.data.message.trim()) {
      return response.data.message;
    }
    if (typeof response?.data?.error === "string" && response.data.error.trim()) {
      return response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();
  const toast = useToast();
  const socialLogin = useAuthStore((s) => s.socialLogin);

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const tokenParam = searchParams.get("token");
  const refreshTokenParam = searchParams.get("refreshToken");
  const errorParam = searchParams.get("error");
  const [socialLoading, setSocialLoading] = useState(false);

  const [form, setForm] = useState<FormState>({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verifyingDev, setVerifyingDev] = useState(false);

  const isUnverifiedError =
    loginMutation.isError &&
    getAuthErrorMessage(loginMutation.error, "").toLowerCase().includes("verify");

  async function handleResendVerification() {
    if (!form.email) {
      toast.error("Email required", "Please enter your email address above.");
      return;
    }
    setResendingEmail(true);
    try {
      const res = await resendVerificationEmail(form.email);
      toast.success("Verification Email Dispatched", res.message);
    } catch (err) {
      toast.error("Resend Failed", getAuthErrorMessage(err, "Couldn't resend verification email."));
    } finally {
      setResendingEmail(false);
    }
  }

  async function handleDevVerify() {
    if (!form.email) {
      toast.error("Email required", "Please enter your email address above.");
      return;
    }
    setVerifyingDev(true);
    try {
      await devVerifyAccount(form.email);
      toast.success("Account Verified!", "Email address verified successfully. Logging you in...");
      await loginMutation.mutateAsync({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error("Verification Failed", getAuthErrorMessage(err, "Couldn't verify account."));
    } finally {
      setVerifyingDev(false);
    }
  }

  useEffect(() => {
    const socialFallback = searchParams.get("social_fallback");
    if (tokenParam) {
      setSocialLoading(true);
      localStorage.setItem(STORAGE_KEYS.accessToken, tokenParam);
      if (refreshTokenParam) {
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshTokenParam);
      }
      useAuthStore.setState({ token: tokenParam, isAuthenticated: true });
      useAuthStore
        .getState()
        .refreshUser()
        .then(() => {
          toast.success("Welcome back!", "Signed in successfully.");
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          toast.error("Sign-in error", getAuthErrorMessage(err, "Failed to load user profile."));
          navigate("/login", { replace: true });
        })
        .finally(() => {
          setSocialLoading(false);
        });
    } else if (socialFallback === "google" || socialFallback === "github") {
      handleSocialCallback(socialFallback as "google" | "github", "");
    } else if (errorParam) {
      toast.error("Sign-in failed", errorParam === "OAuthFailed" ? "Social authentication failed or was cancelled." : errorParam);
    } else if (code && state) {
      const provider = state === "google" || state === "github" ? state : null;
      if (provider) {
        handleSocialCallback(provider, code);
      }
    }
  }, [tokenParam, refreshTokenParam, errorParam, code, state, searchParams]);

  async function handleSocialCallback(provider: "google" | "github", authCode: string) {
    setSocialLoading(true);
    try {
      const redirectUri = `${window.location.origin}/login`;
      await socialLogin(provider, authCode, redirectUri);
      toast.success("Welcome back!", `Signed in successfully via ${provider}.`);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message = getAuthErrorMessage(err, `Failed to authenticate via ${provider}.`);
      toast.error("Social Sign-In Failed", message);
      navigate("/login", { replace: true });
    } finally {
      setSocialLoading(false);
    }
  }

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
    } catch (error) {
      const message = getAuthErrorMessage(error, "Couldn't log in. Please try again.");
      const title = message.toLowerCase().includes("verify") ? "Email verification required" : "Sign-in failed";
      toast.error(title, message);
    }
  }

  if (socialLoading || loginMutation.isSuccess) {
    return (
      <AuthCard>
        <SuccessCheck label="Authenticating session — redirecting..." />
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
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger"
            >
              <p>{getAuthErrorMessage(loginMutation.error, "Couldn't log in. Please try again.")}</p>
              {isUnverifiedError && (
                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="rounded bg-accent-purple/20 px-2.5 py-1 text-xs font-semibold text-accent-purple hover:bg-accent-purple/30 transition-colors"
                  >
                    {resendingEmail ? "Sending..." : "📧 Resend Verification Email"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDevVerify}
                    disabled={verifyingDev}
                    className="rounded bg-accent-emerald/20 px-2.5 py-1 text-xs font-semibold text-accent-emerald hover:bg-accent-emerald/30 transition-colors"
                  >
                    {verifyingDev ? "Verifying..." : "⚡ Verify & Log In Now"}
                  </button>
                </div>
              )}
            </motion.div>
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

        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={loginMutation.isPending || socialLoading}
          onClick={async () => {
            setSocialLoading(true);
            try {
              await socialLogin("google");
              toast.success("Welcome Demo User!", "Signed in with demo account.");
              navigate("/dashboard", { replace: true });
            } catch (err: any) {
              toast.error("Demo Sign-In Failed", getAuthErrorMessage(err, "Couldn't sign in with demo account."));
            } finally {
              setSocialLoading(false);
            }
          }}
          className="w-full"
        >
          ⚡ Try Demo Account
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

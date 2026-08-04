import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuth } from "@/hooks/useAuth";
import { useResendVerificationMutation } from "@/features/auth/hooks";
import { verifyEmail } from "@/services/auth.api";

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * UI-ready per spec — the resend action is wired to `resendVerificationEmail`
 * in auth.api.ts (assumed endpoint) but this screen doesn't gate navigation
 * on real verification status yet; that requires the backend's actual
 * verification flow (poll vs. link vs. websocket) to be confirmed.
 */
export function VerifyEmailPage() {
  const { user } = useAuth();
  const resendMutation = useResendVerificationMutation();
  const [cooldown, setCooldown] = useState(0);
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        const { message } = await verifyEmail(token);
        setStatusMessage(message || "Email verified successfully! Please login to continue.");
        setStatusError(null);
        setTimeout(() => navigate("/login", { replace: true }), 1600);
      } catch (error: any) {
        setStatusError(error?.response?.data?.message ?? error?.message ?? "Email verification failed.");
        setStatusMessage(null);
      }
    };

    verify();
  }, [token, navigate]);

  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = sessionStorage.getItem("dev_verification_url");
    setDevVerificationUrl(url);
  }, [resendMutation.isSuccess]);

  function handleResend() {
    resendMutation.mutate(undefined, { onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS) });
  }

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple shadow-glow-sm"
        >
          <MailCheck size={28} />
        </motion.div>

        <div>
          <h1 className="text-fluid-xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-2 max-w-xs text-sm text-foreground-secondary">
            We've sent a verification link to{" "}
            <span className="text-foreground">{user?.email ?? "your email address"}</span>. Click it to activate your
            account.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleResend}
          disabled={cooldown > 0 || resendMutation.isPending}
          className="mt-2"
        >
          <RotateCw size={14} className={resendMutation.isPending ? "animate-spin" : ""} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </Button>

        {devVerificationUrl && (
          <div className="mt-2 p-3 rounded-xl border border-dashed border-accent-purple/40 bg-accent-purple/5 text-left text-xs max-w-xs shadow-glow-sm">
            <p className="font-semibold text-accent-purple mb-1">🛠️ Developer Helper Tool</p>
            <p className="text-foreground-secondary mb-2">
              Since SMTP mail delivery might be simulated or blocked locally, you can click the button below to verify this email directly:
            </p>
            <a
              href={devVerificationUrl}
              onClick={() => {
                sessionStorage.removeItem("dev_verification_url");
              }}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-glow-sm hover:bg-accent-purple/90 transition-colors w-full text-center"
            >
              Verify Email Directly
            </a>
          </div>
        )}

        {statusMessage && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-accent-emerald">
            {statusMessage}
          </motion.p>
        )}

        {statusError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger">
            {statusError}
          </motion.p>
        )}

        {resendMutation.isSuccess && cooldown === RESEND_COOLDOWN_SECONDS && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-accent-emerald">
            Verification email sent.
          </motion.p>
        )}

        <Link to="/login" className="mt-2 text-xs text-foreground-secondary hover:text-foreground transition-colors">
          Back to login
        </Link>
      </div>
    </AuthCard>
  );
}

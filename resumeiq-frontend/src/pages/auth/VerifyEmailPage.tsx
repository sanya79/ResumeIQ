import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuth } from "@/hooks/useAuth";
import { useResendVerificationMutation } from "@/features/auth/hooks";

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

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

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/cards/GlassCard";
import { GradientBackground } from "@/components/animations/GradientBackground";

/** 403 — shown when an authenticated user lacks permission for a route
 * (role-gated areas). Distinct from 401/session-expired, which redirects
 * straight to /login instead. */
export function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <GradientBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard strong glow className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-danger">Error 403</span>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-fluid-xl font-bold tracking-tight">You don't have access</h1>
          <p className="text-sm text-foreground-secondary">
            Your account doesn't have permission to view this page. If you think this is a mistake, contact your
            workspace admin.
          </p>
          <Link to="/">
            <Button variant="secondary" size="md" className="mt-2">
              <ArrowLeft size={14} />
              Back to home
            </Button>
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}

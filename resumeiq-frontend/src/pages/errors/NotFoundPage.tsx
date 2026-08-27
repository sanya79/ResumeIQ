import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/cards/GlassCard";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <GradientBackground />
      <ParticleField count={16} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard strong glow className="flex flex-col items-center gap-4 p-10 text-center">
          <span className="text-gradient text-fluid-4xl font-[900]">404</span>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-foreground-secondary">
            <Compass size={24} />
          </div>
          <h1 className="text-fluid-lg font-bold tracking-tight">Page not found</h1>
          <p className="text-sm text-foreground-secondary">
            The page you're looking for doesn't exist or may have moved.
          </p>
          <Link to="/">
            <Button variant="gradient" size="md" className="mt-2">
              <ArrowLeft size={14} />
              Back to home
            </Button>
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { GlassCard } from "@/components/cards/GlassCard";
import { FloatingElement } from "@/components/animations/FloatingElement";

/** Compact echo of the landing hero's dashboard mockup, sized for the auth
 * split-screen's left panel. Reuses ScoreRing/GlassCard rather than
 * introducing new visual language for auth specifically. */
export function AuthIllustration() {
  return (
    <div className="relative h-72 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-0 -translate-x-1/2"
      >
        <FloatingElement duration={6}>
          <GlassCard glow className="flex items-center gap-4 px-6 py-5">
            <ScoreRing score={92} size={72} />
            <div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <Sparkles size={12} className="text-accent-cyan" />
                AI Verdict
              </div>
              <p className="mt-1 text-sm font-medium text-white">Strong ATS match</p>
            </div>
          </GlassCard>
        </FloatingElement>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-2 left-0 w-48"
      >
        <FloatingElement duration={7} delay={0.4}>
          <GlassCard strong className="flex items-center gap-2 p-3.5">
            <FileText size={15} className="text-accent-blue" />
            <span className="text-xs text-white/80">resume_final.pdf parsed</span>
          </GlassCard>
        </FloatingElement>
      </motion.div>
    </div>
  );
}

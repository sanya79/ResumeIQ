import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, Briefcase, Sparkles as SparklesIcon } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { FloatingElement } from "@/components/animations/FloatingElement";

/**
 * The hero's signature visual: a cluster of glass panels standing in for a
 * product screenshot. Reacts to cursor position (subtle parallax) and each
 * panel drifts independently via FloatingElement so the group never feels static.
 */
export function FloatingDashboardMockup() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 60, damping: 20 });
  const springY = useSpring(py, { stiffness: 60, damping: 20 });

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 .. 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      px.set(nx);
      py.set(ny);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [px, py]);

  // Each layer moves at a different rate for a light parallax depth effect.
  const scoreX = useTransform(springX, (v) => v * 10);
  const scoreY = useTransform(springY, (v) => v * 10);
  const resumeX = useTransform(springX, (v) => v * -14);
  const resumeY = useTransform(springY, (v) => v * -14);
  const matchX = useTransform(springX, (v) => v * 18);
  const matchY = useTransform(springY, (v) => v * 18);

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md sm:h-[500px]">
      {/* ATS Score Ring — anchor panel */}
      <motion.div style={{ x: scoreX, y: scoreY }} className="absolute left-1/2 top-6 -translate-x-1/2">
        <FloatingElement duration={6}>
          <GlassCard glow className="flex flex-col items-center gap-2 px-8 py-6">
            <ScoreRing score={87} size={104} />
            <span className="text-xs text-foreground-secondary">ATS Score</span>
          </GlassCard>
        </FloatingElement>
      </motion.div>

      {/* Resume card */}
      <motion.div style={{ x: resumeX, y: resumeY }} className="absolute left-0 top-[210px] w-56">
        <FloatingElement duration={7} delay={0.5}>
          <GlassCard strong className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase size={14} className="text-accent-blue" />
              Resume Parsed
            </div>
            <div className="h-2 w-full rounded-full bg-white/10" />
            <div className="h-2 w-3/4 rounded-full bg-white/10" />
            <div className="flex gap-1.5 pt-1">
              <SkillBadge skill="React" matched />
              <SkillBadge skill="SQL" matched />
            </div>
          </GlassCard>
        </FloatingElement>
      </motion.div>

      {/* Job match card */}
      <motion.div style={{ x: matchX, y: matchY }} className="absolute right-0 top-[250px] w-52">
        <FloatingElement duration={5.5} delay={1}>
          <GlassCard strong className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Job Match</span>
              <span className="text-accent-emerald">94%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[94%] rounded-full bg-gradient-success" />
            </div>
            <span className="text-xs text-foreground-secondary">Senior Frontend Engineer</span>
          </GlassCard>
        </FloatingElement>
      </motion.div>

      {/* Skill analysis card */}
      <motion.div style={{ x: resumeX, y: matchY }} className="absolute bottom-2 left-6 w-48">
        <FloatingElement duration={6.5} delay={0.3}>
          <GlassCard strong className="flex flex-col gap-1.5 p-4">
            <span className="text-sm font-medium">Skill Analysis</span>
            <div className="flex flex-wrap gap-1.5">
              <SkillBadge skill="TypeScript" matched />
              <SkillBadge skill="AWS" matched={false} />
            </div>
          </GlassCard>
        </FloatingElement>
      </motion.div>

      {/* Floating notification badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-2 bottom-16 sm:right-2"
      >
        <FloatingElement duration={4.5} delay={0.8}>
          <div className="flex items-center gap-2 rounded-full glass-strong px-3.5 py-2 shadow-glow-emerald">
            <SparklesIcon size={14} className="text-accent-emerald" />
            <TrendingUp size={14} className="text-accent-emerald" />
            <span className="text-xs font-medium text-foreground">Resume Score Increased +18</span>
          </div>
        </FloatingElement>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { staggerContainerVariants, slideRightVariants } from "@/components/animations/variants";

const items = ["ATS Score", "Resume Analysis", "AI Suggestions", "Job Matching", "Interview Preparation"];

/** Animated checklist for the auth split-screen's left panel — reuses the
 * shared stagger/slide variants rather than defining new motion values. */
export function FeatureChecklist() {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className="flex flex-col gap-3"
    >
      {items.map((item) => (
        <motion.li key={item} variants={slideRightVariants} className="flex items-center gap-3 text-sm text-white/80">
          <CheckCircle2 size={16} className="shrink-0 text-accent-emerald" />
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

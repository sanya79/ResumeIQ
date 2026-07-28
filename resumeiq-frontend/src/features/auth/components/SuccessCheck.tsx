import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessCheckProps {
  label?: string;
}

/** Animated checkmark used after a successful auth action (login success
 * flash, reset-password confirmation, etc). Circle draws in, then the
 * check springs in on top. */
export function SuccessCheck({ label }: SuccessCheckProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-success shadow-glow-emerald"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check size={28} className="text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

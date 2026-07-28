import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
  gradient?: boolean;
}

/** Linear progress indicator, animates its fill from 0 to `value` on mount. */
export function ProgressBar({ value, label, className, gradient = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-foreground-secondary">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden"
      >
        <motion.div
          className={cn("h-full rounded-full", gradient ? "bg-gradient-primary" : "bg-accent-cyan")}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

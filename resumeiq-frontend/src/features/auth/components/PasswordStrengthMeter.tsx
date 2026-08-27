import { motion } from "framer-motion";
import { getPasswordStrength } from "../validation";

interface PasswordStrengthMeterProps {
  password: string;
}

/** Four-segment animated strength bar with a label — purely a UX nudge
 * during registration/reset, not the actual validation gate. */
export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

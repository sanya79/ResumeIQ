import { motion, useMotionValue, useSpring } from "framer-motion";
import { type MouseEvent, type ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Wraps any element (typically a Button) and pulls it toward the cursor
 * within its bounds — the "magnetic" hover pattern popularized by Linear/Framer.
 */
export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.2 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((e.clientX - bounds.left - bounds.width / 2) * strength);
    y.set((e.clientY - bounds.top - bounds.height / 2) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

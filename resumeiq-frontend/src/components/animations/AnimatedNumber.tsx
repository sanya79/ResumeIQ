import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
}

/** Counts up from 0 to `value` once scrolled into view — the shared
 * number-reveal used across the analytics grid and stat cards. */
export function AnimatedNumber({ value, suffix = "", className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20, mass: 1 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${Math.round(latest)}${suffix}`;
    });
  }, [spring, suffix]);

  return (
    <motion.span ref={ref} className={className}>
      0{suffix}
    </motion.span>
  );
}

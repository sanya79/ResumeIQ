import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { slideRightVariants } from "./variants";

interface SlideRightProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

/** Content slides in moving toward the right (enters from the left). */
export function SlideRight({ children, delay = 0, className, once = true }: SlideRightProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={slideRightVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

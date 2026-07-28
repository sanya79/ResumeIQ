import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { slideLeftVariants } from "./variants";

interface SlideLeftProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

/** Content slides in moving toward the left (enters from the right). */
export function SlideLeft({ children, delay = 0, className, once = true }: SlideLeftProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={slideLeftVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

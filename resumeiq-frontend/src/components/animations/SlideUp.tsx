import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { slideUpVariants } from "./variants";

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function SlideUp({ children, delay = 0, className, once = true }: SlideUpProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={slideUpVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

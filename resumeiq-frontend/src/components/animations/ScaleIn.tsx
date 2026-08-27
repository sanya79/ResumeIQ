import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { scaleInVariants } from "./variants";

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function ScaleIn({ children, delay = 0, className, once = true }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={scaleInVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

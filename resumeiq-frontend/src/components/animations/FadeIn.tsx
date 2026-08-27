import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInVariants } from "./variants";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({ children, delay = 0, className, once = true }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={fadeInVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

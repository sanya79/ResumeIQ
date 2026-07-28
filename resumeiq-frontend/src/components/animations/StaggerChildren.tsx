import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerContainerVariants, slideUpVariants } from "./variants";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
}

/** Container that staggers the reveal of its direct motion children. */
export function StaggerChildren({ children, className }: StaggerChildrenProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/** Use as the direct child of <StaggerChildren>; inherits its parent's stagger timing. */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={slideUpVariants}>
      {children}
    </motion.div>
  );
}

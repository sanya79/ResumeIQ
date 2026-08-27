import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion variants. Every animation wrapper in this folder
 * pulls from here so easing/duration stay consistent across the app
 * instead of being redefined per component.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const; // snappy, premium "ease-out-expo"-ish curve

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

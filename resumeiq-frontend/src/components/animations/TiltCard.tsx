import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type MouseEvent, type ReactNode, useRef } from "react";
import { cn } from "@/utils/cn";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/** 3D pointer-follow tilt, used to give feature/pricing cards depth on hover. */
export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), springConfig);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    px.set((e.clientX - bounds.left) / bounds.width);
    py.set((e.clientY - bounds.top) / bounds.height);
  }

  function handleMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

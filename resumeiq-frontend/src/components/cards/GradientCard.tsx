import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface GradientCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gradient?: "primary" | "warm" | "success";
}

const gradientMap: Record<NonNullable<GradientCardProps["gradient"]>, string> = {
  primary: "bg-gradient-primary",
  warm: "bg-gradient-warm",
  success: "bg-gradient-success",
};

/** Solid gradient-filled surface for high-emphasis callouts (upgrade
 * prompts, hero stat, primary CTA panel). Use sparingly against GlassCard. */
export function GradientCard({ children, gradient = "primary", className, ...props }: GradientCardProps) {
  return (
    <div
      className={cn("rounded-2xl p-6 text-white shadow-glow-lg", gradientMap[gradient], className)}
      {...props}
    >
      {children}
    </div>
  );
}

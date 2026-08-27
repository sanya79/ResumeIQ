import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "purple" | "blue" | "cyan" | "pink" | "emerald" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-white/[0.06] text-foreground-secondary border-white/[0.08]",
  purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
  cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
  pink: "bg-accent-pink/10 text-accent-pink border-accent-pink/20",
  emerald: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
  danger: "bg-danger/10 text-danger border-danger/20",
};

/** Small status/label pill — for statuses like "Parsed", "High Match", "New". */
export function Badge({ children, tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

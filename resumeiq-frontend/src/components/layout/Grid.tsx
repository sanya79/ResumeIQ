import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

const colStyles: Record<NonNullable<GridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const gapStyles: Record<NonNullable<GridProps["gap"]>, string> = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

/** Responsive grid primitive for card/feature/stat layouts. */
export function Grid({ children, cols = 3, gap = "md", className, ...props }: GridProps) {
  return (
    <div className={cn("grid", colStyles[cols], gapStyles[gap], className)} {...props}>
      {children}
    </div>
  );
}

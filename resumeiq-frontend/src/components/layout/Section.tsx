import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Vertical rhythm primitive for full-width page sections. */
export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section className={cn("section-spacing", className)} {...props}>
      {children}
    </section>
  );
}

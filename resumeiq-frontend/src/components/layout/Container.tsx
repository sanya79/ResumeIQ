import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Max-width content wrapper with responsive horizontal padding, including
 * a wider ceiling on ultra-wide (3xl) displays. */
export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn("container-page", className)} {...props}>
      {children}
    </div>
  );
}

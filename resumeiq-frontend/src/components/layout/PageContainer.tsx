import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Top-level wrapper for a routed page's content — pairs with AppLayout,
 * which renders the persistent chrome (Sidebar/TopBar) around it. */
export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen w-full", className)} {...props}>
      {children}
    </div>
  );
}

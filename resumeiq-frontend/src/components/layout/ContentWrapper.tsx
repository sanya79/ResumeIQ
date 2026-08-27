import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContentWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Inner scroll/content region used inside PageContainer, offset for a
 * fixed Sidebar/TopBar once those are present in a page layout. */
export function ContentWrapper({ children, className, ...props }: ContentWrapperProps) {
  return (
    <div className={cn("container-page section-spacing", className)} {...props}>
      {children}
    </div>
  );
}

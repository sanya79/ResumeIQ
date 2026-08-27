import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface FooterProps {
  children?: ReactNode;
  className?: string;
}

/** Marketing-site footer shell. Content (columns, links, legal text) is
 * supplied by the page that uses it — kept structural here. */
export function Footer({ children, className }: FooterProps) {
  return (
    <footer className={cn("border-t border-surface-border", className)}>
      <div className="container-page py-12">
        {children ?? (
          <p className="text-sm text-foreground-secondary">
            © {new Date().getFullYear()} ResumeIQ. All rights reserved.
          </p>
        )}
      </div>
    </footer>
  );
}

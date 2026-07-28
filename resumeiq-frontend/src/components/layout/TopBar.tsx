import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TopBarProps {
  title?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** In-app header shown above page content within AppLayout — distinct from
 * Navbar, which is for the public/marketing site. */
export function TopBar({ title, breadcrumb, actions, className }: TopBarProps) {
  return (
    <div className={cn("sticky top-0 z-30 glass", className)}>
      <div className="flex h-16 items-center justify-between px-6">
        <div className="min-w-0">
          {breadcrumb && <div className="text-xs text-foreground-secondary mb-0.5">{breadcrumb}</div>}
          {title && <h1 className="text-fluid-lg font-semibold truncate">{title}</h1>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useUiStore } from "@/stores/uiStore";

export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  header?: ReactNode;
  footer?: ReactNode;
}

/** Collapsible in-app navigation rail. Reads/writes `isSidebarOpen` from
 * the shared uiStore so its state is controllable from anywhere (e.g. a
 * TopBar toggle button). */
export function Sidebar({ items, header, footer }: SidebarProps) {
  const isOpen = useUiStore((s) => s.isSidebarOpen);

  return (
    <aside
      className={cn(
        "glass h-screen sticky top-0 flex flex-col shrink-0 transition-[width] duration-300 ease-out",
        isOpen ? "w-64" : "w-[76px]"
      )}
    >
      {header && <div className="px-4 py-5">{header}</div>}

      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/[0.08] text-foreground"
                  : "text-foreground-secondary hover:text-foreground hover:bg-white/[0.04]"
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {isOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="px-4 py-4 border-t border-surface-border">{footer}</div>}
    </aside>
  );
}

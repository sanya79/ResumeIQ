import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { UserMenu } from "./UserMenu";
import { primaryNavItems } from "./navigation";
import { useUiStore } from "@/stores/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";

/**
 * Root layout for authenticated app routes (Dashboard, Resume Analysis,
 * ATS, Matching, Interview, ...). Renders the persistent Sidebar + TopBar
 * chrome around whichever route is active, matching the shell every
 * in-app page shares.
 */
/** Prefix-matched so param routes (e.g. /ats/:resumeId) resolve to the
 * same title as their base route. Falls back to "Dashboard" for any
 * route not yet in this list, matching the previous hardcoded behavior. */
function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/resumes")) return "Resume Analysis";
  if (pathname.startsWith("/ats")) return "ATS Intelligence";
  if (pathname.startsWith("/matching")) return "Job Matching";
  if (pathname.startsWith("/interview")) return "Interview AI";
  if (pathname.startsWith("/analytics")) return "Analytics";
  if (pathname.startsWith("/history")) return "History";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
}

export function AppLayout() {
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <Sidebar
        items={primaryNavItems}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="relative inline-flex">
                <Sparkles size={18} className="text-accent-cyan" />
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 blur-md text-accent-cyan animate-pulse-glow"
                >
                  <Sparkles size={18} />
                </span>
              </span>
              {isSidebarOpen && (
                <span>
                  Resume<span className="text-gradient">IQ</span>
                </span>
              )}
            </div>
          </div>
        }
        footer={
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            {isSidebarOpen && <span>Collapse</span>}
          </button>
        }
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar
          breadcrumb="ResumeIQ"
          title={title}
          actions={<UserMenu user={user} />}
        />
        <main className={cn("flex-1")}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

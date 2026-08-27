import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Moon, Sun, Search as SearchIcon, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/utils/cn";
import { getUserDisplayName } from "@/utils/userUtils";
import type { User } from "@/types";

const notifications = [
  { id: "n1", title: "ATS analysis complete", detail: "Your latest resume scored 87/100.", unread: true },
  { id: "n2", title: "New job match found", detail: "92% match with a Senior Frontend role.", unread: true },
  { id: "n3", title: "Interview practice reminder", detail: "You have 3 unanswered questions.", unread: false },
];

/** Right-hand cluster of the in-app TopBar: search trigger, notification
 * bell, theme toggle, and the profile menu. Kept as one component since
 * these controls share the TopBar's `actions` slot and layout rhythm. */
export const UserMenu = memo(function UserMenu({ user }: { user: User | null }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const toast = useToast();
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast.success(`${nextTheme === "light" ? "Light" : "Dark"} mode activated`, `Switched interface theme to ${nextTheme} mode.`);
  }

  const menuItems: DropdownItem[] = [
    { label: "Profile", value: "profile", icon: <UserRound size={15} /> },
    { label: "Settings", value: "settings", icon: <Settings size={15} /> },
    { label: "Log out", value: "logout", icon: <LogOut size={15} />, danger: true },
  ];

  function handleSelect(value: string) {
    if (value === "logout") {
      logout();
      toast.info("Logged out", "Come back soon.");
    } else if (value === "profile" || value === "settings") {
      navigate("/profile");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip content="Search (⌘K)">
        <button
          type="button"
          aria-label="Search"
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground sm:inline-flex"
        >
          <SearchIcon size={17} />
        </button>
      </Tooltip>

      <div className="relative">
        <Tooltip content="Notifications">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-pink shadow-glow-pink" />
            )}
          </button>
        </Tooltip>
        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} aria-hidden />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-40 mt-2 w-80 glass-strong rounded-xl p-2 shadow-card"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-semibold">Notifications</span>
                  <span className="text-xs text-foreground-secondary">{unreadCount} new</span>
                </div>
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          n.unread ? "bg-accent-cyan" : "bg-transparent"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-xs text-foreground-secondary">{n.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Tooltip content={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          {theme === "dark" ? <Moon size={17} /> : <Sun size={17} className="text-amber-400" />}
        </button>
      </Tooltip>
      <Dropdown
        align="right"
        items={menuItems}
        onSelect={handleSelect}
        trigger={
          <span className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-white/[0.06]">
            <Avatar name={getUserDisplayName(user)} src={user?.avatarUrl} size="sm" />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-medium text-foreground">{getUserDisplayName(user)}</span>
              <span className="block text-xs text-foreground-secondary">{user?.role ?? "candidate"}</span>
            </span>
            <ChevronDown size={14} className="hidden text-foreground-secondary md:block" />
          </span>
        }
      />
    </div>
  );
});

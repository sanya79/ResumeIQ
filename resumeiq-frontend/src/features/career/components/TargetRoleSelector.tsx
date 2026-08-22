import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Target } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn } from "@/utils/cn";
import type { TargetRoleOption } from "@/pages/career/data";

interface TargetRoleSelectorProps {
  options: TargetRoleOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Searchable role combobox — built from the same primitives as
 * `Dropdown`/`SearchBar` (outside-click + Escape to close, glass popover)
 * rather than the native `Select`, since the spec calls for a searchable
 * input rather than a plain `<select>`. */
export function TargetRoleSelector({ options, value, onChange, disabled }: TargetRoleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.group.toLowerCase().includes(q));
  }, [options, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, TargetRoleOption[]>();
    filtered.forEach((o) => {
      const bucket = map.get(o.group) ?? [];
      bucket.push(o);
      map.set(o.group, bucket);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl border border-surface-border bg-white/[0.04] px-4 text-left text-sm transition-colors",
          "hover:border-accent-purple/40 disabled:opacity-50 disabled:pointer-events-none",
          open && "border-accent-purple/60 bg-white/[0.06]"
        )}
      >
        <Target size={16} className="shrink-0 text-accent-purple" />
        <span className={cn("flex-1 truncate", selected ? "text-foreground" : "text-foreground-secondary")}>
          {selected ? selected.label : "Select your target role..."}
        </span>
        <ChevronDown size={16} className={cn("shrink-0 text-foreground-secondary transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-white/20 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <SearchBar
              autoFocus
              placeholder="Search roles..."
              onChange={setQuery}
              className="mb-2"
            />
            <div className="max-h-64 overflow-y-auto pr-1">
              {grouped.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-foreground-secondary">No roles match "{query}"</p>
              )}
              {grouped.map(([group, items]) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary/70">
                    {group}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={item.value === value}
                      onClick={() => {
                        onChange(item.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        item.value === value
                          ? "bg-accent-purple/10 text-accent-purple"
                          : "text-foreground-secondary hover:bg-white/[0.06] hover:text-foreground"
                      )}
                    >
                      {item.label}
                      {item.value === value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

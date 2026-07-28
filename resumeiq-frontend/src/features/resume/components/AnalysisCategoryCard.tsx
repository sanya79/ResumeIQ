import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ListChecks, Search, Briefcase, FolderGit2, LayoutGrid, SpellCheck2, GraduationCap, TrendingUp, Crown, BadgeCheck, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { cn } from "@/utils/cn";
import type { AtsBreakdownItem } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  section_completeness: ListChecks,
  keyword_relevance: Search,
  experience_quality: Briefcase,
  project_quality: FolderGit2,
  formatting_quality: LayoutGrid,
  readability_quality: SpellCheck2,
  education_quality: GraduationCap,
  impact_metrics: TrendingUp,
  leadership_indicators: Crown,
  certification_quality: BadgeCheck,
};

interface AnalysisCategoryCardProps {
  item: AtsBreakdownItem;
}

/** One card per real ATS scoring rule returned by the engine — expandable
 * to show the reason, supporting evidence, and targeted suggestions. */
export function AnalysisCategoryCard({ item }: AnalysisCategoryCardProps) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[item.id] ?? ListChecks;
  const percentage = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;

  return (
    <HoverLift>
      <GlassCard className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex rounded-xl bg-gradient-primary p-2.5 text-white shadow-glow-sm">
            <Icon size={18} />
          </div>
          <span className="text-fluid-lg font-bold tabular-nums">{percentage}%</span>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
          <ProgressBar value={percentage} className="mt-2" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center justify-between gap-2 text-left text-xs font-medium text-foreground-secondary"
        >
          Details
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-2 text-xs leading-relaxed text-foreground-secondary">{item.reason}</p>
              {item.suggestions.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {item.suggestions.map((s, i) => (
                    <li key={i} className={cn("rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs text-foreground")}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </HoverLift>
  );
}

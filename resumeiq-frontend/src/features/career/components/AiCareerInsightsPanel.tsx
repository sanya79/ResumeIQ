import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lightbulb, Sparkles, TrendingUp, AlertTriangle, MessagesSquare } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { insightMeta } from "@/pages/career/data";
import { cn } from "@/utils/cn";
import type { CareerInsight, CareerInsightType } from "@/types";

const insightIcon: Record<CareerInsightType, typeof Sparkles> = {
  "biggest-strength": Sparkles,
  "critical-gap": AlertTriangle,
  "fastest-improvement": TrendingUp,
  "career-advice": Lightbulb,
  "interview-tip": MessagesSquare,
};

/**
 * Expandable AI insight cards. Modeled on the same expand/collapse
 * interaction as the shared `Accordion` (grid-rows height animation,
 * chevron rotate, multiple-open) but with an icon + category badge in the
 * header — `Accordion`'s `question` field is string-only, so this is a
 * purpose-built sibling rather than a forced fit into that component.
 */
export function AiCareerInsightsPanel({ insights }: { insights: CareerInsight[] }) {
  const [openIds, setOpenIds] = useState<string[]>(insights.slice(0, 1).map((i) => i.id));

  function toggle(id: string) {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  return (
    <GlassCard className="flex flex-col divide-y divide-surface-border">
      {insights.map((insight) => {
        const meta = insightMeta[insight.type];
        const Icon = insightIcon[insight.type];
        const isOpen = openIds.includes(insight.id);

        return (
          <div key={insight.id} className="py-2 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => toggle(insight.id)}
              aria-expanded={isOpen}
              aria-controls={`${insight.id}-panel`}
              className="flex w-full items-center justify-between gap-4 py-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    meta.tone === "emerald" && "bg-accent-emerald/10 text-accent-emerald",
                    meta.tone === "pink" && "bg-danger/10 text-danger",
                    meta.tone === "cyan" && "bg-accent-cyan/10 text-accent-cyan",
                    meta.tone === "purple" && "bg-accent-purple/10 text-accent-purple"
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="flex flex-col gap-1">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <span className="text-sm font-medium text-foreground sm:text-base">{insight.title}</span>
                </span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 text-foreground-secondary"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${insight.id}-panel`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-3 pl-12 text-sm leading-relaxed text-foreground-secondary">{insight.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </GlassCard>
  );
}

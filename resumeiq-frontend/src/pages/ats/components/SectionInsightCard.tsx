import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { getBreakdownPercentage } from "../data";
import type { AtsBreakdownItem, AtsStrengthOrWeakness } from "@/types";

interface SectionInsightCardProps {
  item: AtsBreakdownItem;
  matchedStrength?: AtsStrengthOrWeakness;
  matchedWeakness?: AtsStrengthOrWeakness;
}

/** Richer sibling to AnalysisCategoryCard — same expand pattern, but pulls
 * together three real data sources (breakdown score, matched strength,
 * matched weakness) instead of just the one breakdown item. Kept as a
 * separate component since it serves the dashboard's "Section Analysis"
 * requirement specifically, not a redesign of AnalysisCategoryCard. */
export function SectionInsightCard({ item, matchedStrength, matchedWeakness }: SectionInsightCardProps) {
  const [open, setOpen] = useState(false);
  const percentage = getBreakdownPercentage(item);

  return (
    <HoverLift>
      <GlassCard id={`section-${item.id}`} className="flex flex-col gap-3 scroll-mt-24">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
          <span className="shrink-0 text-fluid-lg font-bold tabular-nums">{percentage}%</span>
        </div>
        <ProgressBar value={percentage} />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center justify-between gap-2 text-left text-xs font-medium text-foreground-secondary"
        >
          {matchedStrength || matchedWeakness ? "Strengths, weaknesses & fixes" : "AI explanation"}
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
              className="flex flex-col gap-2 overflow-hidden"
            >
              <p className="text-xs leading-relaxed text-foreground-secondary">{item.reason}</p>

              {matchedStrength && (
                <div className="flex items-start gap-2 rounded-lg bg-accent-emerald/10 px-2.5 py-2 text-xs">
                  <ThumbsUp size={13} className="mt-0.5 shrink-0 text-accent-emerald" />
                  <span className="text-foreground-secondary">{matchedStrength.message}</span>
                </div>
              )}
              {matchedWeakness && (
                <div className="flex items-start gap-2 rounded-lg bg-danger/10 px-2.5 py-2 text-xs">
                  <ThumbsDown size={13} className="mt-0.5 shrink-0 text-danger" />
                  <span className="text-foreground-secondary">{matchedWeakness.message}</span>
                </div>
              )}
              {item.suggestions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {item.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs">
                      <Lightbulb size={12} className="mt-0.5 shrink-0 text-accent-cyan" />
                      <span className="text-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {!matchedStrength && !matchedWeakness && (
                <Badge tone="neutral" className="w-fit">
                  Not flagged as a standout strength or weak area
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </HoverLift>
  );
}

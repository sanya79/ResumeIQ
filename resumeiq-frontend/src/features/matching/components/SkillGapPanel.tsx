import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { getGapSeverity } from "@/pages/matching/data";
import { cn } from "@/utils/cn";
import type { SkillGapCategory } from "@/types";

function GapBar({ current, required }: { current: number; required: number }) {
  const max = Math.max(current, required, 1);
  const currentPct = Math.min(100, (current / max) * 100);
  const requiredPct = Math.min(100, (required / max) * 100);

  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${currentPct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <span
        className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-white/80"
        style={{ left: `${requiredPct}%` }}
        aria-hidden
      />
    </div>
  );
}

function SkillGapRow({ item }: { item: SkillGapCategory }) {
  const severity = getGapSeverity(item.current, item.required);

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{item.category}</span>
        <Badge tone={severity === "none" ? "emerald" : severity === "minor" ? "cyan" : "pink"}>
          {severity === "none" ? (
            <>
              <CheckCircle2 size={11} /> On target
            </>
          ) : (
            <>
              <AlertTriangle size={11} /> Gap
            </>
          )}
        </Badge>
      </div>
      <GapBar current={item.current} required={item.required} />
      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        <span>
          Current: <span className="font-medium text-foreground">{item.current}</span>
        </span>
        <span>
          Required: <span className="font-medium text-foreground">{item.required}</span>
        </span>
      </div>
      {item.missingItems.length > 0 && (
        <div className={cn("flex flex-wrap gap-1.5 pt-1")}>
          {item.missingItems.map((s) => (
            <SkillBadge key={s} skill={s} matched={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SkillGapPanel({ categories }: { categories: SkillGapCategory[] }) {
  return (
    <GlassCard className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {categories.map((item) => (
        <SkillGapRow key={item.id} item={item} />
      ))}
    </GlassCard>
  );
}

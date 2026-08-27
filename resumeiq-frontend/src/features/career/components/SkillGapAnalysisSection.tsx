import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getGapSeverity } from "@/pages/career/data";
import { cn } from "@/utils/cn";
import type { CareerSkillGapItem } from "@/types";

function DualBar({ current, required }: { current: number; required: number }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, current)}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <span
        className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-white/80"
        style={{ left: `${Math.min(100, required)}%` }}
        aria-hidden
      />
    </div>
  );
}

function SkillGapCard({ item }: { item: CareerSkillGapItem }) {
  const severity = getGapSeverity(item.currentLevel, item.requiredLevel);

  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{item.category}</span>
        <Badge tone={severity === "none" ? "emerald" : severity === "minor" ? "cyan" : "pink"}>
          {severity === "none" ? (
            <>
              <CheckCircle2 size={11} /> On target
            </>
          ) : (
            <>
              <AlertTriangle size={11} /> Gap of {item.gap}
            </>
          )}
        </Badge>
      </div>

      <DualBar current={item.currentLevel} required={item.requiredLevel} />

      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        <span>
          Current: <span className="font-medium text-foreground">{item.currentLevel}%</span>
        </span>
        <span>
          Required: <span className="font-medium text-foreground">{item.requiredLevel}%</span>
        </span>
      </div>

      <p className={cn("rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-foreground-secondary")}>
        {item.explanation}
      </p>
    </GlassCard>
  );
}

export function SkillGapAnalysisSection({ categories }: { categories: CareerSkillGapItem[] }) {
  return (
    <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((item) => (
        <StaggerItem key={item.id}>
          <SkillGapCard item={item} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

import {
  Code2, Users, FolderGit2, Briefcase, GraduationCap, BadgeCheck, KeyRound, ListChecks, type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getCategoryPercentage } from "@/pages/matching/data";
import type { MatchCategoryScore } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  technical_skills: Code2,
  soft_skills: Users,
  projects: FolderGit2,
  experience: Briefcase,
  education: GraduationCap,
  certifications: BadgeCheck,
  keywords: KeyRound,
  responsibilities: ListChecks,
};

function BreakdownCard({ item }: { item: MatchCategoryScore }) {
  const Icon = iconMap[item.id] ?? ListChecks;
  const percentage = getCategoryPercentage(item.score, item.maxScore);

  return (
    <HoverLift>
      <GlassCard className="flex h-full flex-col gap-3">
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
        <p className="text-xs leading-relaxed text-foreground-secondary">{item.explanation}</p>
        <div className="mt-auto rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-foreground">
          <span className="font-medium text-accent-cyan">Recommendation: </span>
          {item.recommendation}
        </div>
      </GlassCard>
    </HoverLift>
  );
}

export function MatchBreakdownGrid({ items }: { items: MatchCategoryScore[] }) {
  return (
    <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <BreakdownCard item={item} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

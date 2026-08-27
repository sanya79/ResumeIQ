import { Code2, Users, FolderGit2, Network, FileText, Building2, type LucideIcon } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { GlassCard } from "@/components/cards/GlassCard";
import type { RecommendedPracticeItem } from "@/types";

const iconMap: Record<RecommendedPracticeItem["category"], LucideIcon> = {
  "Coding Practice": Code2,
  Behavioral: Users,
  "Project Discussion": FolderGit2,
  "System Design": Network,
  HR: FileText,
  Technical: Code2,
  Mixed: Building2,
};

export function RecommendedPracticeGrid({ items }: { items: RecommendedPracticeItem[] }) {
  return (
    <AnalyticsCard title="Recommended Practice" subtitle="Next best areas to focus on">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = iconMap[item.category] ?? Code2;
          return (
            <HoverLift key={item.id}>
              <GlassCard className="flex flex-col gap-3">
                <span className="inline-flex w-fit rounded-xl bg-gradient-primary p-2.5 text-white shadow-glow-sm">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">{item.description}</p>
                </div>
              </GlassCard>
            </HoverLift>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

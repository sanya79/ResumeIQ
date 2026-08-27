import { BookOpen, Clock, ExternalLink, FileText, GraduationCap, Terminal, Video } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { groupResourcesByCategory, resourceCategoryOrder, getDifficultyTone } from "@/pages/career/data";
import type { LearningResource, LearningResourceCategory } from "@/types";

const categoryIcon: Record<LearningResourceCategory, typeof Video> = {
  Videos: Video,
  Courses: GraduationCap,
  Books: BookOpen,
  "Practice Platforms": Terminal,
  Documentation: FileText,
};

function ResourceCard({ resource }: { resource: LearningResource }) {
  const Icon = categoryIcon[resource.category];
  return (
    <HoverLift className="h-full">
      <GlassCard className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-accent-cyan">
            <Icon size={16} />
          </div>
          <Badge tone={getDifficultyTone(resource.difficulty)}>{resource.difficulty}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-semibold leading-snug text-foreground">{resource.title}</h4>
          <p className="mt-0.5 text-xs text-foreground-secondary">{resource.provider}</p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-surface-border pt-3 text-xs text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {resource.estimatedHours}h
          </span>
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-medium text-accent-cyan hover:text-accent-cyan/80"
            >
              Open <ExternalLink size={11} />
            </a>
          )}
        </div>
      </GlassCard>
    </HoverLift>
  );
}

export function LearningResourcesSection({ resources }: { resources: LearningResource[] }) {
  const grouped = groupResourcesByCategory(resources);
  const categories = resourceCategoryOrder.filter((c) => (grouped[c]?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold text-foreground-secondary">{category}</h3>
          <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {grouped[category]!.map((resource) => (
              <StaggerItem key={resource.id}>
                <ResourceCard resource={resource} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      ))}
    </div>
  );
}

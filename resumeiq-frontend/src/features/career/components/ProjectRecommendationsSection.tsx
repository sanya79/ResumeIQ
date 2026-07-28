import { Clock, Code2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getDifficultyTone } from "@/pages/career/data";
import type { ProjectRecommendation } from "@/types";

function ProjectCard({ project }: { project: ProjectRecommendation }) {
  return (
    <HoverLift className="h-full">
      <GlassCard className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-accent-purple">
            <Code2 size={18} />
          </div>
          <Badge tone={getDifficultyTone(project.difficulty)}>{project.difficulty}</Badge>
        </div>

        <h4 className="text-sm font-semibold leading-snug text-foreground">{project.title}</h4>

        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-surface-border bg-white/[0.04] px-2 py-0.5 text-[11px] text-foreground-secondary"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
          <Clock size={12} /> {project.estimatedTime}
        </div>

        {project.skillsCovered.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 border-t border-surface-border pt-3">
            {project.skillsCovered.map((skill) => (
              <SkillBadge key={skill} skill={skill} matched />
            ))}
          </div>
        )}
      </GlassCard>
    </HoverLift>
  );
}

export function ProjectRecommendationsSection({ projects }: { projects: ProjectRecommendation[] }) {
  return (
    <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <StaggerItem key={project.id}>
          <ProjectCard project={project} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

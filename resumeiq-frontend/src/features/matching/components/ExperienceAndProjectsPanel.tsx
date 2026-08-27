import { Briefcase, CalendarClock, FolderGit2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { HoverLift } from "@/components/animations/HoverLift";
import { getExperienceVerdict, getMatchTierTone } from "@/pages/matching/data";
import type { ExperienceMatch, ProjectRelevance } from "@/types";

function ExperienceMatchPanel({ experience }: { experience: ExperienceMatch }) {
  const verdict = getExperienceVerdict(experience.candidateYears, experience.requiredYears);
  const maxYears = Math.max(experience.candidateYears, experience.requiredYears, 1);

  return (
    <AnalyticsCard
      title="Experience Match"
      subtitle={experience.summary}
      actions={<Briefcase size={16} className="text-accent-purple" />}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary">
            <span>Required experience</span>
            <span className="font-medium text-foreground">
              {experience.requiredYears} yrs · {experience.requiredLevel}
            </span>
          </div>
          <ProgressBar value={(experience.requiredYears / maxYears) * 100} gradient={false} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary">
            <span>Your experience</span>
            <span className="font-medium text-foreground">
              {experience.candidateYears} yrs · {experience.candidateLevel}
            </span>
          </div>
          <ProgressBar value={(experience.candidateYears / maxYears) * 100} />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-sm">
          <CalendarClock size={15} className="shrink-0 text-accent-cyan" />
          <span className="text-foreground">{verdict}</span>
        </div>
      </div>
    </AnalyticsCard>
  );
}

function ProjectCard({ project }: { project: ProjectRelevance }) {
  return (
    <HoverLift>
      <GlassCard className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderGit2 size={16} className="text-accent-cyan" />
            <h4 className="text-sm font-semibold text-foreground">{project.name}</h4>
          </div>
          <Badge tone={getMatchTierTone(project.relevanceScore)}>{Math.round(project.relevanceScore)}% relevant</Badge>
        </div>
        <ProgressBar value={project.relevanceScore} />

        {project.matchingTechnologies.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-foreground-secondary">Matching technologies</p>
            <div className="flex flex-wrap gap-1.5">
              {project.matchingTechnologies.map((t) => (
                <SkillBadge key={t} skill={t} matched />
              ))}
            </div>
          </div>
        )}

        {project.matchingResponsibilities.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-foreground-secondary">Matching responsibilities</p>
            <ul className="flex flex-col gap-1">
              {project.matchingResponsibilities.map((r, i) => (
                <li key={i} className="text-xs text-foreground-secondary">
                  · {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.suggestions.length > 0 && (
          <div className="mt-auto rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-foreground">
            <span className="font-medium text-accent-purple">Improve: </span>
            {project.suggestions[0]}
          </div>
        )}
      </GlassCard>
    </HoverLift>
  );
}

interface ExperienceAndProjectsPanelProps {
  experience: ExperienceMatch;
  projects: ProjectRelevance[];
}

export function ExperienceAndProjectsPanel({ experience, projects }: ExperienceAndProjectsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <ExperienceMatchPanel experience={experience} />

      {projects.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground-secondary">Project Relevance</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

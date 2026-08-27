import { UserCircle2, HeartPulse } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Badge } from "@/components/ui/Badge";
import { ResumeMetaCard } from "@/features/resume/components/ResumeMetaCard";
import { StructuredProfileComingSoon } from "@/features/resume/components/StructuredProfileComingSoon";
import type { Resume, User } from "@/types";

interface ResumeSummaryPanelProps {
  resume: Resume;
  user?: User | null;
}

/**
 * "Resume Summary" panel. Candidate name comes from the real authenticated
 * user (types/user.ts) — genuinely known data. Experience/Projects/Skills
 * would need `parsedResumeData` the backend doesn't persist yet (see
 * StructuredProfileComingSoon's docstring), so this reuses that same
 * honest placeholder rather than fabricating a profile. ATS Score and
 * Resume Health are both real, straight from the resume's atsScorecard.
 */
export function ResumeSummaryPanel({ resume, user }: ResumeSummaryPanelProps) {
  const scorecard = resume.atsScorecard;

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow-sm">
          <UserCircle2 size={24} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? "Candidate"}</p>
          <p className="truncate text-xs text-foreground-secondary">{user?.email ?? "Resume selected for matching"}</p>
        </div>
      </GlassCard>

      <ResumeMetaCard resume={resume} />

      {scorecard ? (
        <GlassCard glow className="flex items-center gap-5">
          <ScoreRing score={scorecard.overallScore} size={92} />
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <HeartPulse size={15} className="text-accent-emerald" /> Resume Health
            </div>
            <Badge tone={scorecard.overallScore >= 70 ? "emerald" : scorecard.overallScore >= 50 ? "cyan" : "pink"}>
              ATS Score {Math.round(scorecard.overallScore)}/100
            </Badge>
            <p className="mt-2 text-xs text-foreground-secondary">
              {Math.round(scorecard.confidence * 100)}% engine confidence · v{resume.version}
            </p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <p className="text-sm text-foreground-secondary">
            This resume hasn't finished ATS analysis yet, so its health score isn't available.
          </p>
        </GlassCard>
      )}

      <StructuredProfileComingSoon />
    </div>
  );
}

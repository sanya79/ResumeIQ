import { UserCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/cards/GlassCard";

/**
 * The upload pipeline parses candidate name/contact/skills/experience/
 * projects internally (pipeline.service.js `_parseResumeData`) to feed
 * the ATS engine, but never persists or returns that structured data —
 * only `rawText` and the ATS scorecard are stored on the Resume model.
 * Rather than fabricate a skills/timeline/projects UI against data that
 * doesn't exist, this is a clearly-labeled placeholder until the backend
 * exposes it (persist `parsedResumeData` on the Resume document and
 * return it alongside atsScorecard).
 */
export function StructuredProfileComingSoon() {
  return (
    <GlassCard>
      <EmptyState
        icon={<UserCircle2 size={22} />}
        title="Structured profile — coming soon"
        description="Candidate details, extracted skills, work timeline, and projects will appear here once the API persists and returns parsed resume data. For now, the full ATS analysis on the left already reflects your real upload."
      />
    </GlassCard>
  );
}

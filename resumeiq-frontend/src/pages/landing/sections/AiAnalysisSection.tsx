import { CheckCircle2, FileText } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { SlideRight } from "@/components/animations/SlideRight";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { Badge } from "@/components/ui/Badge";
import { aiRecommendations } from "../data";

export function AiAnalysisSection() {
  return (
    <Section className="relative">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <SlideRight>
            <GlassCard className="flex flex-col gap-4 p-8">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground-secondary">
                <FileText size={16} className="text-accent-blue" />
                resume_final_v3.pdf
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-white/[0.03] p-5">
                <div className="h-3 w-2/3 rounded-full bg-white/10" />
                <div className="h-2 w-1/2 rounded-full bg-white/5" />
                <div className="mt-3 h-2 w-full rounded-full bg-white/5" />
                <div className="h-2 w-full rounded-full bg-white/5" />
                <div className="h-2 w-4/5 rounded-full bg-white/5" />
                <div className="mt-3 h-2 w-full rounded-full bg-white/5" />
                <div className="h-2 w-3/4 rounded-full bg-white/5" />
              </div>
            </GlassCard>
          </SlideRight>

          <div>
            <Badge tone="pink" className="mb-4">
              AI Analysis
            </Badge>
            <h2 className="mb-4 text-fluid-3xl font-extrabold tracking-tight">
              Recommendations, <span className="text-gradient">not just a score</span>
            </h2>
            <p className="mb-8 max-w-md text-fluid-base text-foreground-secondary">
              Every scan comes with prioritized, specific edits — not vague advice to "add more keywords."
            </p>

            <StaggerChildren>
              <div className="flex flex-col gap-3">
                {aiRecommendations.map((rec) => (
                  <StaggerItem key={rec}>
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 border border-surface-border">
                      <CheckCircle2 size={17} className="shrink-0 text-accent-emerald" />
                      <span className="text-sm text-foreground">{rec}</span>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerChildren>
          </div>
        </div>
      </Container>
    </Section>
  );
}

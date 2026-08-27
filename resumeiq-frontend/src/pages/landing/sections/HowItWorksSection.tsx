import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { Badge } from "@/components/ui/Badge";
import { howItWorksSteps } from "../data";

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="relative">
      <Container>
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <Badge tone="blue" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-fluid-3xl font-extrabold tracking-tight">
            From resume to <span className="text-gradient">insight</span> in five steps
          </h2>
        </FadeIn>

        <StaggerChildren>
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Connecting line — desktop only, sits behind the step numbers */}
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-surface-border to-transparent lg:block" />

            {howItWorksSteps.map((step, i) => (
              <StaggerItem key={step.title}>
                <HoverLift>
                  <GlassCard className="relative flex h-full flex-col items-start gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-glow-sm">
                        {i + 1}
                      </span>
                      <step.icon size={18} className="text-accent-cyan" />
                    </div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="text-xs text-foreground-secondary">{step.description}</p>
                  </GlassCard>
                </HoverLift>
              </StaggerItem>
            ))}
          </div>
        </StaggerChildren>
      </Container>
    </Section>
  );
}

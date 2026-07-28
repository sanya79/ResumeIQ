import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ScaleIn } from "@/components/animations/ScaleIn";

export function CtaSection() {
  return (
    <Section>
      <Container>
        <ScaleIn>
          <GlassCard glow className="relative overflow-hidden px-8 py-16 text-center sm:px-16">
            <GradientBackground className="opacity-70" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="max-w-2xl text-fluid-3xl font-extrabold tracking-tight">
                Ready to <span className="text-gradient">boost your resume?</span>
              </h2>
              <p className="max-w-md text-fluid-base text-foreground-secondary">
                Run a free AI analysis in under a minute — no account required to get your first score.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <MagneticButton>
                  <Button variant="gradient" size="lg" className="group">
                    Start Free Analysis
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </MagneticButton>
                <MagneticButton>
                  <Button variant="outline" size="lg">
                    <LayoutDashboard size={17} />
                    Explore Dashboard
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </GlassCard>
        </ScaleIn>
      </Container>
    </Section>
  );
}

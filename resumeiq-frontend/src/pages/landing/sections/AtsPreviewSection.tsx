import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GlassCard } from "@/components/cards/GlassCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { SlideRight } from "@/components/animations/SlideRight";
import { SlideLeft } from "@/components/animations/SlideLeft";
import { Badge } from "@/components/ui/Badge";
import { atsBreakdown } from "../data";

interface AtsBar {
  label: string;
  value: number;
}

export function AtsPreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  // Values start at 0 and only jump to their real targets once the section
  // scrolls into view, so ScoreRing/ProgressBar's built-in fill animation
  // plays at the right moment instead of on page mount.
  const [score, setScore] = useState(0);
  const [bars, setBars] = useState<AtsBar[]>(atsBreakdown.map((b) => ({ label: b.label, value: 0 })));

  useEffect(() => {
    if (isInView) {
      setScore(87);
      setBars(atsBreakdown.map((b) => ({ label: b.label, value: b.value })));
    }
  }, [isInView]);

  return (
    <Section className="relative overflow-hidden">
      <Container>
        <div ref={ref} className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <SlideRight>
            <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
              <Badge tone="emerald">ATS Intelligence</Badge>
              <h2 className="text-fluid-3xl font-extrabold tracking-tight">
                See exactly how <span className="text-gradient">ATS software</span> reads your resume
              </h2>
              <p className="max-w-md text-fluid-base text-foreground-secondary">
                A single 0–100 score, broken down by the signals recruiting software actually filters on.
              </p>
              <GlassCard glow className="mt-4 flex items-center gap-5 self-center px-8 py-6 lg:self-start">
                <ScoreRing score={score} size={110} />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Overall ATS Score</p>
                  <p className="text-xs text-foreground-secondary">Based on 5 weighted signals</p>
                </div>
              </GlassCard>
            </div>
          </SlideRight>

          <SlideLeft>
            <GlassCard className="flex flex-col gap-5">
              {bars.map((bar) => (
                <ProgressBar key={bar.label} label={bar.label} value={bar.value} />
              ))}
            </GlassCard>
          </SlideLeft>
        </div>
      </Container>
    </Section>
  );
}

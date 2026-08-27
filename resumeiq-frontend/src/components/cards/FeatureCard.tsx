import { type ReactNode } from "react";
import { TiltCard } from "@/components/animations/TiltCard";
import { GlassCard } from "./GlassCard";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/** Marketing-page feature tile with a pointer-tilt interaction — for
 * "Why ResumeIQ" / capability grids. */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <TiltCard>
      <GlassCard className="h-full">
        <div className="mb-4 inline-flex rounded-xl bg-gradient-primary p-2.5 text-white shadow-glow-sm">
          {icon}
        </div>
        <h3 className="mb-1.5 text-fluid-base font-semibold">{title}</h3>
        <p className="text-sm text-foreground-secondary">{description}</p>
      </GlassCard>
    </TiltCard>
  );
}

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Heart, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { TiltCard } from "@/components/animations/TiltCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { cn } from "@/utils/cn";
import type { ScoreCardDatum } from "../data";

/** Pulsing heart visual with the score centered inside — the "Resume
 * Health" card's signature, as distinct from the ring/bars/check others use. */
function HeartVisual({ value }: { value: number }) {
  return (
    <div className="relative inline-flex h-[88px] w-[88px] items-center justify-center">
      <motion.span
        aria-hidden
        className="absolute inline-flex"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart size={56} className="fill-accent-pink/20 text-accent-pink" strokeWidth={1.5} />
      </motion.span>
      <span className="relative text-xs font-bold tabular-nums text-foreground">{value}%</span>
    </div>
  );
}

/** Small ascending bar cluster — the "Job Match" card's signature visual. */
function BarsVisual() {
  return (
    <div className="flex h-[88px] w-[88px] items-end justify-center gap-1.5">
      {[0.5, 0.8, 0.65, 1, 0.75].map((h, i) => (
        <motion.span
          key={i}
          className="w-2 rounded-full bg-gradient-primary"
          style={{ opacity: 0.5 + h * 0.5 }}
          initial={{ height: 0 }}
          animate={{ height: `${h * 100}%` }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

/** Renders the signature visual for a given card type — switch-based
 * rather than four bespoke card components, since only the centerpiece changes. */
function CardVisual({ datum }: { datum: ScoreCardDatum }) {
  switch (datum.visual) {
    case "ring":
      return <ScoreRing score={datum.value} size={88} />;
    case "heart":
      return <HeartVisual value={datum.value} />;
    case "bars":
      return <BarsVisual />;
    case "check":
      return (
        <div className="relative inline-flex h-[88px] w-[88px] items-center justify-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <CheckCircle2 size={56} className="text-accent-emerald" strokeWidth={1.5} />
          </motion.span>
        </div>
      );
  }
}

interface ScoreCardProps {
  datum: ScoreCardDatum;
}

/** One of the four hero analytics cards — same GlassCard shell across all
 * four, with a different signature visual and trend badge per metric. */
export const ScoreCard = memo(function ScoreCard({ datum }: ScoreCardProps) {
  const isUp = datum.trend.direction === "up";

  return (
    <TiltCard maxTilt={4} className="h-full">
      <HoverLift className="h-full">
        <GlassCard glow className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-foreground-secondary">{datum.label}</p>
              <p className="mt-1 text-fluid-2xl font-bold tabular-nums">
                <AnimatedNumber value={datum.value} />
                <span className="text-base font-medium text-foreground-secondary"> /100</span>
              </p>
              <span
                className={cn(
                  "mt-1 inline-flex items-center gap-0.5 text-xs font-medium",
                  isUp ? "text-accent-emerald" : "text-danger"
                )}
              >
                {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {datum.trend.value}% this month
              </span>
            </div>
            <CardVisual datum={datum} />
          </div>

          <p className="text-xs leading-relaxed text-foreground-secondary">{datum.description}</p>
        </GlassCard>
      </HoverLift>
    </TiltCard>
  );
});

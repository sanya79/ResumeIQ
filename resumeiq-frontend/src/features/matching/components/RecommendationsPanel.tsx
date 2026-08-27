import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";

export function RecommendationsPanel({ recommendations }: { recommendations: string[] }) {
  const [index, setIndex] = useState(0);

  if (recommendations.length === 0) {
    return (
      <GlassCard>
        <p className="text-sm text-foreground-secondary">No outstanding recommendations — strong alignment with this role.</p>
      </GlassCard>
    );
  }

  const current = recommendations[index];

  function goPrev() {
    setIndex((i) => (i - 1 + recommendations.length) % recommendations.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % recommendations.length);
  }

  return (
    <GlassCard glow className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
        <Sparkles size={13} className="text-accent-purple" />
        AI Recommendation {index + 1} of {recommendations.length}
      </div>

      <div className="relative flex min-h-[96px] w-full max-w-xl items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <CheckCircle2 size={22} className="shrink-0 text-accent-emerald" />
            <p className="text-fluid-base font-medium text-foreground">{current}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={goPrev} aria-label="Previous recommendation">
          <ChevronLeft size={16} />
        </Button>
        <div className="flex items-center gap-1.5">
          {recommendations.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to recommendation ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-accent-purple" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={goNext} aria-label="Next recommendation">
          <ChevronRight size={16} />
        </Button>
      </div>
    </GlassCard>
  );
}

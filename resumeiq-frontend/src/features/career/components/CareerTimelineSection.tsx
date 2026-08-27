import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { cn } from "@/utils/cn";
import type { CareerTimelineStop } from "@/types";

const statusStyles: Record<CareerTimelineStop["status"], string> = {
  complete: "bg-accent-emerald border-accent-emerald text-white",
  current: "bg-accent-purple border-accent-purple text-white animate-pulse-glow",
  upcoming: "bg-transparent border-surface-border text-foreground-secondary",
};

/** Horizontal phase tracker: Current Position → Learning Phase → Project
 * Building → Interview Ready → Target Role. Scrolls on small screens
 * instead of wrapping, so the left-to-right story stays intact. */
export function CareerTimelineSection({ stops }: { stops: CareerTimelineStop[] }) {
  return (
    <GlassCard className="overflow-x-auto">
      <div className="flex min-w-[720px] items-start gap-2 sm:min-w-0">
        {stops.map((stop, i) => (
          <div key={stop.id} className="flex flex-1 flex-col items-center gap-3 text-center">
            <div className="flex w-full items-center">
              <span
                className={cn("h-px flex-1 bg-surface-border", i === 0 && "opacity-0")}
                aria-hidden
              />
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  statusStyles[stop.status]
                )}
              >
                {stop.status === "complete" ? <Check size={16} /> : i + 1}
              </motion.div>
              <span
                className={cn("h-px flex-1 bg-surface-border", i === stops.length - 1 && "opacity-0")}
                aria-hidden
              />
            </div>
            <div>
              <p className={cn("text-xs font-semibold", stop.status === "upcoming" ? "text-foreground-secondary" : "text-foreground")}>
                {stop.phase}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground-secondary">{stop.label}</p>
              <p className="text-[11px] text-foreground-secondary/70">{stop.estimate}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

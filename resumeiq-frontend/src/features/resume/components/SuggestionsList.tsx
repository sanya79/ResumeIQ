import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";

interface SuggestionsListProps {
  suggestions: string[];
}

/** The engine's top-10 highest-impact suggestions, prioritized by
 * potential score gain — animates in one row at a time. */
export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  return (
    <AnalyticsCard title="AI Suggestions" subtitle="Prioritized by potential score gain" actions={<Sparkles size={16} className="text-accent-purple" />}>
      {suggestions.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {suggestions.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent-emerald" />
              {s}
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-foreground-secondary">No outstanding suggestions — this resume is in great shape.</p>
      )}
    </AnalyticsCard>
  );
}

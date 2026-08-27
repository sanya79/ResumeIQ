import { type ReactNode, memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TiltCard } from "@/components/animations/TiltCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { cn } from "@/utils/cn";
import type { QuickActionDatum } from "../data";

const gradientMap: Record<QuickActionDatum["gradient"], string> = {
  primary: "bg-gradient-primary",
  warm: "bg-gradient-warm",
  success: "bg-gradient-success",
};

interface QuickActionCardProps {
  datum: QuickActionDatum;
  icon: ReactNode;
}

/** Large icon + gradient-border action tile — navigates to the relevant
 * module route (routes 404 until those modules are built, same as the
 * rest of the app's in-progress navigation). */
export const QuickActionCard = memo(function QuickActionCard({ datum, icon }: QuickActionCardProps) {
  return (
    <TiltCard maxTilt={6}>
      <HoverLift lift={4}>
        <Link
          to={datum.href}
          className="border-gradient-animated group flex h-full flex-col gap-4 rounded-2xl bg-surface p-5 backdrop-blur-glass"
        >
          <div
            className={cn(
              "inline-flex w-fit rounded-xl p-3 text-white shadow-glow-sm transition-transform group-hover:scale-105",
              gradientMap[datum.gradient]
            )}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{datum.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">{datum.description}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-accent-cyan opacity-0 transition-opacity group-hover:opacity-100">
            Get started <ArrowUpRight size={13} />
          </span>
        </Link>
      </HoverLift>
    </TiltCard>
  );
});

import { cn } from "@/utils/cn";

interface GradientBackgroundProps {
  className?: string;
}

/** Full-bleed animated mesh/gradient backdrop for hero or CTA sections.
 * Purely decorative — render behind content with `absolute inset-0 -z-10`. */
export function GradientBackground({ className }: GradientBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute -top-1/3 left-1/4 h-[600px] w-[600px] rounded-full bg-accent-purple/20 blur-[120px] animate-float" />
      <div
        className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-blue/20 blur-[120px] animate-float"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-accent-cyan/15 blur-[120px] animate-float"
        style={{ animationDelay: "2.4s" }}
      />
    </div>
  );
}

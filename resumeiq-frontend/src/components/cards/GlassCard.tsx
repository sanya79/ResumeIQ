import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  strong?: boolean;
}

/** 
 * Signature glassmorphism surface used across cards, panels, and modals.
 * Features an interactive 3D volumetric spotlight and border hover glow effect tracking the cursor.
 */
export function GlassCard({
  children,
  glow = false,
  strong = false,
  className,
  ...props
}: GlassCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "relative overflow-hidden rounded-2xl p-6 shadow-card transition-all duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Background Volumetric Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(250px circle at ${coords.x}px ${coords.y}px, rgba(45, 212, 191, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 100%)`,
        }}
      />
      {/* Border Glow Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(200px circle at ${coords.x}px ${coords.y}px, rgba(45, 212, 191, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)`,
          maskImage: `linear-gradient(black, black) content-box, linear-gradient(black, black)`,
          WebkitMaskImage: `linear-gradient(black, black) content-box, linear-gradient(black, black)`,
          maskComposite: `exclude`,
          WebkitMaskComposite: `destination-out`,
          padding: '1px',
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

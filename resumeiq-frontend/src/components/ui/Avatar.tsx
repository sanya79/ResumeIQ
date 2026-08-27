import { cn } from "@/utils/cn";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** User/candidate avatar — falls back to a gradient initials tile when no
 * image is supplied (or if it fails to load). */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover border border-surface-border", sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-primary font-semibold text-white",
        sizeStyles[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

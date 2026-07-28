import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "block";
}

/** Shimmering placeholder for async content — matches the `.skeleton`
 * utility defined in index.css. */
export function Skeleton({ className, variant = "block" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "skeleton",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circle" && "rounded-full",
        className
      )}
    />
  );
}

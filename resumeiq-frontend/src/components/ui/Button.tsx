import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-white text-background hover:bg-white/90",
  secondary: "glass text-foreground hover:bg-white/[0.08]",
  ghost: "text-foreground-secondary hover:text-foreground hover:bg-white/[0.04]",
  outline: "border border-surface-border text-foreground bg-transparent hover:border-accent-purple/50 hover:bg-white/[0.03]",
  gradient:
    "bg-gradient-primary text-white shadow-glow hover:shadow-[0_0_55px_rgba(139,92,246,0.4)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

const MotionLink = motion.create(Link);

interface ButtonAsButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  to?: undefined;
}

interface ButtonAsLinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  /** Presence of `to` renders the button as a router Link instead of a <button>. */
  to: string;
  replace?: LinkProps["replace"];
  state?: LinkProps["state"];
  onClick?: () => void;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/**
 * Base button primitive. Renders a <button> by default; pass `to="/path"`
 * to render a router <Link> styled identically — keeps CTAs that navigate
 * from ending up as a <button> nested inside/around an <a>.
 */
export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 25 } as const,
  };

  if ("to" in props && props.to) {
    const { to, replace, state, onClick } = props as ButtonAsLinkProps;
    return (
      <MotionLink className={classes} to={to} replace={replace} state={state} onClick={onClick} {...motionProps}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button className={classes} {...motionProps} {...(props as ButtonAsButtonProps)}>
      {children}
    </motion.button>
  );
}

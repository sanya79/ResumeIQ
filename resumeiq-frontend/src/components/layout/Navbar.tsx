import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

interface NavbarProps {
  logoHref?: string;
  actions?: ReactNode;
  links?: { label: string; href: string }[];
  className?: string;
}

/** Marketing/public-site top nav — sticky, glass, condenses on scroll via
 * the `glass` utility (no scroll-driven JS needed, backdrop-blur handles it). */
export function Navbar({ logoHref = "/", actions, links = [], className }: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-40 glass border-b border-primary/10", className)}>
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={logoHref} className="flex items-center gap-2 font-mono text-sm uppercase tracking-[0.25em] font-bold text-white">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span>
            Resume<span className="text-gradient">IQ</span>
          </span>
        </Link>

        {links.length > 0 && (
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-[0.18em] uppercase text-white/60">
            {links.map((link) => (
              <Link key={link.href} to={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {actions && <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em]">{actions}</div>}
      </div>
    </header>
  );
}

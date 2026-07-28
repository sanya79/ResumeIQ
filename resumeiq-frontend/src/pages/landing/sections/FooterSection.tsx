import { Github, Linkedin, Twitter, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { footerLinks } from "../data";

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function FooterSection() {
  return (
    <Footer>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Sparkles size={17} className="text-accent-cyan" />
            <span>
              Resume<span className="text-gradient">IQ</span>
            </span>
          </Link>
          <p className="mt-3 max-w-[220px] text-sm text-foreground-secondary">
            AI-powered resume intelligence for job seekers who want data, not guesswork.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h4 className="mb-3 text-sm font-medium text-foreground">{group}</h4>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-border pt-6 text-xs text-foreground-secondary sm:flex-row">
        <span>© {new Date().getFullYear()} ResumeIQ. All rights reserved.</span>
        <span>Built for job seekers, by people who read too many resumes.</span>
      </div>
    </Footer>
  );
}

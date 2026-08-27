import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Ultra-wide support in addition to Tailwind's default sm/md/lg/xl/2xl.
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px", // ultra-wide
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "hsl(var(--background) / <alpha-value>)",
          secondary: "hsl(var(--secondary) / <alpha-value>)",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground) / <alpha-value>)",
          secondary: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          hover: "hsl(var(--accent) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        accent: {
          purple: "hsl(var(--primary) / <alpha-value>)",
          blue: "hsl(var(--primary) / <alpha-value>)",
          cyan: "hsl(var(--primary) / 0.8)",
          pink: "#EC4899",
          emerald: "hsl(var(--success) / <alpha-value>)",
        },
        muted: "hsl(var(--muted-foreground) / <alpha-value>)",
        danger: "hsl(var(--destructive) / <alpha-value>)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #22D3EE 100%)",
        "gradient-warm": "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
        "gradient-success": "linear-gradient(135deg, #10B981 0%, #22D3EE 100%)",
        "gradient-radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.18), transparent 60%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(139,92,246,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(59,130,246,0.12) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(34,211,238,0.1) 0px, transparent 50%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      // Fluid type scale via clamp() — scales smoothly between mobile and 3xl viewports.
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.2vw, 0.8rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.25vw, 0.95rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.3vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)",
        "fluid-xl": "clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)",
        "fluid-2xl": "clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)",
        "fluid-3xl": "clamp(2.25rem, 1.7rem + 2.5vw, 3.5rem)",
        "fluid-4xl": "clamp(2.75rem, 1.9rem + 3.8vw, 4.75rem)",
        "fluid-5xl": "clamp(3.25rem, 2.1rem + 5.2vw, 6rem)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        glow: "var(--shadow-depth)",
        "glow-sm": "var(--shadow-depth)",
        "glow-lg": "var(--shadow-depth-hover)",
        "glow-cyan": "var(--shadow-depth)",
        "glow-pink": "var(--shadow-depth)",
        "glow-emerald": "var(--shadow-depth)",
        card: "var(--shadow-depth)",
        depth: "var(--shadow-depth)",
        "depth-hover": "var(--shadow-depth-hover)",
      },
      backdropBlur: {
        xs: "4px",
        glass: "24px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "gradient-move": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "border-spin": {
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-move": "gradient-move 6s ease infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "border-spin": "border-spin 4s linear infinite",
      },
      backgroundSize: {
        "gradient-lg": "200% 200%",
      },
    },
  },
  plugins: [],
} satisfies Config;

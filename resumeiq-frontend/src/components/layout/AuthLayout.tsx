import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FeatureChecklist } from "@/features/auth/components/FeatureChecklist";
import { AuthIllustration } from "@/features/auth/components/AuthIllustration";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { cn } from "@/utils/cn";

function AuthFlipCard() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="relative w-full max-w-md" style={{ perspective: 1200 }}>
      <motion.div
        animate={{ rotateY: isRegister ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full relative"
      >
        {/* Front Face: Login */}
        <div
          className={cn(
            "w-full backface-hidden",
            isRegister ? "absolute inset-0 pointer-events-none opacity-0" : "relative opacity-100"
          )}
          style={{ transition: "opacity 0.2s ease" }}
        >
          <LoginPage />
        </div>

        {/* Back Face: Register */}
        <div
          className={cn(
            "w-full backface-hidden",
            isRegister ? "relative opacity-100" : "absolute inset-0 pointer-events-none opacity-0"
          )}
          style={{
            transform: "rotateY(180deg)",
            transition: "opacity 0.2s ease",
          }}
        >
          <RegisterPage />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Split-screen shell for login/register/forgot-password/reset-password.
 * Left: dark animated brand panel. Right: centered content (with 3D flip card for login/register).
 */
export function AuthLayout() {
  const location = useLocation();
  const isAuthFlipRoute = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-transparent lg:flex lg:flex-col lg:justify-between lg:p-12 border-r border-white/5">
        <Link to="/" className="relative z-10 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.25em] font-bold text-white">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span>
            Resume<span className="text-gradient">IQ</span>
          </span>
        </Link>

        <div className="relative z-10 flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="max-w-sm text-fluid-2xl font-bold leading-tight text-white uppercase font-sans">
              Your resume, read the way <span className="text-gradient">AI recruiters</span> read it.
            </h2>
          </motion.div>

          <AuthIllustration />
          <FeatureChecklist />
        </div>

        <p className="relative z-10 text-[10px] font-mono tracking-[0.1em] text-white/40 uppercase">© {new Date().getFullYear()} ResumeIQ</p>
      </div>

      <div className="relative flex items-center justify-center bg-transparent px-6 py-16">
        <div className="w-full max-w-md">
          {isAuthFlipRoute ? <AuthFlipCard /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}

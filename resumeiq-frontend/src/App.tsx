import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";
import { SpotlightBackground } from "@/components/animations/SpotlightBackground";
import { VolumetricCanvas } from "@/components/animations/VolumetricCanvas";

/**
 * Root component. Intentionally thin — providers live in main.tsx,
 * routing/pages are wired in via the router config in src/routes.
 * ToastContainer is mounted once here so any component can fire toasts
 * via the `useToast` hook without prop drilling.
 */
export default function App() {
  // Zustand's persist middleware restores `token`/`user` synchronously from
  // localStorage, but that snapshot could be stale (revoked, expired). One
  // silent refreshUser() call on boot confirms it's still valid.
  const token = useAuthStore((s) => s.token);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    if (token) refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SpotlightBackground />
      <VolumetricCanvas />
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

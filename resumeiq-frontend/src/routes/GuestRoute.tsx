import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/** Gate for auth screens (login/register) — redirects already-authed users. */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

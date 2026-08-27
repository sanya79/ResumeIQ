import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/** Gate for routes that require an authenticated session and a verified email. */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.isEmailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.some((role) => user?.role?.toLowerCase() === role.toLowerCase())) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

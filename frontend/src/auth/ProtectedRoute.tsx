import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth, type Role } from "../auth/AuthContext";

export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: Role[] }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

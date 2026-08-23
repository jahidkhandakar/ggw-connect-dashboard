import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-navy/60">
        Loading…
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

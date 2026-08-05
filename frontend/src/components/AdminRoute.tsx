import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p aria-live="polite">Checking access...</p>;
  }

  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/home" replace />;
}

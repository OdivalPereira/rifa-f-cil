import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "./ui/Loader";

export function AdminRoute() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

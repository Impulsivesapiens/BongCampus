import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

const roleHomeMap = {
  user: "/student/home",
  instructor: "/instructor/dashboard",
  admin: "/admin/users",
};

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={roleHomeMap[user.role]} replace />;
  return children;
}

export function RoleRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role !== allowedRole) return <Navigate to={roleHomeMap[user?.role] || "/auth"} replace />;
  return children;
}
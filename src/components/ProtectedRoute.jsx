import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AcessoNegado from "@/components/AcessoNegado";

/**
 * Conforto visual: esconde telas de quem não tem o papel certo.
 * Quem protege de verdade são os middlewares auth/exigir do servidor.
 */
export default function ProtectedRoute({ papeis }) {
  const { user } = useAuth();
  const local = useLocation();

  if (!user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(local.pathname)}`} replace />;
  }
  if (papeis && !papeis.includes(user.role)) return <AcessoNegado />;
  return <Outlet />;
}

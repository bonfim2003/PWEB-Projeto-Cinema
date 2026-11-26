import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MeusIngressos from "./pages/MeusIngressos";
import FilmeDetalhe from "./pages/FilmeDetalhe";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFilmes from "./pages/admin/AdminFilmes";
import AdminSessoes from "./pages/admin/AdminSessoes";
import AdminReservas from "./pages/admin/AdminReservas";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRoutes = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/filme/:id" element={<FilmeDetalhe />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/meus-ingressos" element={<MeusIngressos />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="filmes" element={<AdminFilmes />} />
          <Route path="sessoes" element={<AdminSessoes />} />
          <Route path="reservas" element={<AdminReservas />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
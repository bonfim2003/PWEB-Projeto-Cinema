import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import SessaoDetalhe from "@/pages/SessaoDetalhe";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MeusIngressos from "@/pages/MeusIngressos";
import Portaria from "@/pages/Portaria";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminFilmes from "@/pages/admin/AdminFilmes";
import AdminLocais from "@/pages/admin/AdminLocais";
import AdminSessoes from "@/pages/admin/AdminSessoes";
import AdminSessaoReservas from "@/pages/admin/AdminSessaoReservas";
import AdminUsuarios from "@/pages/admin/AdminUsuarios";

function Rotas() {
  const { carregando } = useAuth();

  if (carregando) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sessao/:id" element={<SessaoDetalhe />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/register" element={<Navigate to="/cadastro" replace />} />

      <Route element={<ProtectedRoute papeis={["CLIENTE"]} />}>
        <Route path="/meus-ingressos" element={<MeusIngressos />} />
      </Route>

      <Route element={<ProtectedRoute papeis={["OPERADOR", "ADMIN"]} />}>
        <Route path="/portaria" element={<Portaria />} />
      </Route>

      <Route element={<ProtectedRoute papeis={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="filmes" element={<AdminFilmes />} />
          <Route path="locais" element={<AdminLocais />} />
          <Route path="sessoes" element={<AdminSessoes />} />
          <Route path="sessoes/:id" element={<AdminSessaoReservas />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Rotas />
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

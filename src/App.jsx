import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import FigmaImport5e4029c8bd8e4bb38cc9157c8cee241a from './pages/FigmaImport5e4029c8bd8e4bb38cc9157c8cee241a';
// Add page imports here
import Home from './pages/Home';
import MeusIngressos from './pages/MeusIngressos';
import FilmeDetalhe from './pages/FilmeDetalhe';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Mfa from './pages/Mfa';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFilmes from './pages/admin/AdminFilmes';
import AdminSessoes from './pages/admin/AdminSessoes';
import AdminReservas from './pages/admin/AdminReservas';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/FigmaImport5e4029c8bd8e4bb38cc9157c8cee241a" element={<FigmaImport5e4029c8bd8e4bb38cc9157c8cee241a />} />
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/filme/:id" element={<FilmeDetalhe />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />

      <Route
        element={
          <ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />
        }
      >
        <Route path="/meus-ingressos" element={<MeusIngressos />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="filmes" element={<AdminFilmes />} />
          <Route path="sessoes" element={<AdminSessoes />} />
          <Route path="reservas" element={<AdminReservas />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
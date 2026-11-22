import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginWithMfa } from "@/lib/authMfa";
import { signInWithProvider } from "@/lib/authMfaFlow";
import MfaFlow from "@/components/MfaFlow";
import { MfaScreen } from "@/components/MfaParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { base44 } from "@/api/base44Client";

async function destinoPosLogin(returnTo) {
  if (returnTo && returnTo !== "/") return returnTo;
  try {
    const usuario = await base44.auth.me();
    return usuario?.role === "admin" ? "/admin" : "/";
  } catch {
    return "/";
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginWithMfa(email, password);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      window.location.href = await destinoPosLogin(returnTo);
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithProvider("google", returnTo);
    } catch (err) {
      setError(err.message || "Não foi possível entrar com o Google.");
    }
  };

  if (mfaChallenge)
    return (
      <MfaScreen>
        <MfaFlow challenge={mfaChallenge} returnTo={returnTo} />
      </MfaScreen>
    );

  return (
    <AuthLayout
      icon={LogIn}
      title="Bem-vindo de volta"
      subtitle="Entre para acompanhar suas reservas"
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-semibold text-coral hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="mb-6 h-12 w-full rounded-xl border-2 border-ink/25 text-sm font-medium"
        onClick={handleGoogle}
      >
        <GoogleIcon className="mr-2 h-5 w-5" />
        Continuar com Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink/15" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-ink/40">ou</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-coral bg-coral/20 p-3 text-sm text-ink">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-ink/25 bg-cream pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-coral hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-2 border-ink/25 bg-cream pl-10 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink"
            >
              {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl border-2 border-ink bg-coral font-semibold text-ink hover:bg-coral/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
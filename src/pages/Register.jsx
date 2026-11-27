import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Mail, Lock, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

const REGRAS_SENHA = [
  { id: "tamanho", label: "Pelo menos 8 caracteres", test: (s) => s.length >= 8 },
  { id: "maiuscula", label: "Uma letra maiúscula (A-Z)", test: (s) => /[A-Z]/.test(s) },
  { id: "minuscula", label: "Uma letra minúscula (a-z)", test: (s) => /[a-z]/.test(s) },
  { id: "numero", label: "Um número (0-9)", test: (s) => /\d/.test(s) },
];

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const loginPath =
    "/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const regraFaltando = REGRAS_SENHA.find((regra) => !regra.test(password));
    if (regraFaltando) {
      setError(`A senha precisa ter: ${regraFaltando.label.toLowerCase()}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.cadastrar({ name: nome, email, password });
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Crie sua conta"
      subtitle="Cadastre-se para reservar seu lugar"
      footer={
        <>
          Já tem conta?{" "}
          <Link to={loginPath} className="font-semibold text-coral hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border-2 border-coral bg-coral/20 p-3 text-sm font-medium text-ink">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              id="nome"
              autoComplete="name"
              autoFocus
              placeholder="Como aparece na portaria"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-12 border-2 border-ink/25 bg-cream pl-10"
              minLength={2}
              required
            />
          </div>
        </div>

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
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-2 border-ink/25 bg-cream pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
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

          <ul className="space-y-1 pt-1 text-xs" aria-label="Requisitos da senha">
            {REGRAS_SENHA.map((regra) => {
              const atendida = regra.test(password);
              return (
                <li
                  key={regra.id}
                  className={`flex items-center gap-1.5 transition-colors ${
                    atendida ? "font-medium text-emerald-700" : "text-ink/55"
                  }`}
                >
                  {atendida ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0 text-ink/35" />
                  )}
                  <span>{regra.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden="true"
            />
            <Input
              id="confirm"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 border-2 border-ink/25 bg-cream pl-10 pr-11"
              required
            />
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
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
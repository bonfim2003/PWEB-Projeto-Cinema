import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Sempre mostramos a mesma resposta, independente do e-mail existir.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Recuperar senha"
      subtitle="Enviaremos um link para você criar uma nova senha"
      footer={
        <Link to="/login" className="font-semibold text-coral hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" /> Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <p className="text-center text-sm text-ink/70">
          Se existir uma conta com esse e-mail, você receberá um link de
          recuperação em instantes.
        </p>
      ) : (
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
          <Button
            type="submit"
            className="h-12 w-full rounded-xl border-2 border-ink bg-coral font-semibold text-ink hover:bg-coral/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
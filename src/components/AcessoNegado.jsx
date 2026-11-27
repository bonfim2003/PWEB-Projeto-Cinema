import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth, inicioDoPapel } from "@/lib/AuthContext";

export default function AcessoNegado() {
  const { user, sair } = useAuth();
  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-coral">
        <ShieldAlert className="h-6 w-6 text-ink" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-ink">Área restrita</h1>
      <p className="mt-3 max-w-sm text-sm text-ink/60">
        Sua conta não tem permissão para abrir esta página. Se você faz parte da
        produção, peça acesso a um administrador.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to={inicioDoPapel(user?.role)}
          className="rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink"
        >
          Voltar
        </Link>
        <button
          type="button"
          onClick={sair}
          className="rounded-full border-2 border-ink px-6 py-3 text-sm font-semibold text-ink"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}

// Peças visuais compartilhadas pelo painel, no mesmo estilo do site.
import { AlertCircle, Loader2 } from "lucide-react";

export const campo =
  "mt-1 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

export function Cabecalho({ sobre, titulo, acao }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-serif text-lg italic text-plum">{sobre}</p>
        <h1 className="mt-1 font-display text-3xl text-ink lg:text-4xl">{titulo}</h1>
      </div>
      {acao}
    </div>
  );
}

export function BotaoPrincipal({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-5 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Carregando() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
    </div>
  );
}

export function Erro({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border-2 border-coral bg-coral/20 px-3 py-2 text-sm text-ink">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

const STATUS = {
  ABERTA: "bg-lagoon/40",
  ATIVA: "bg-lagoon/40",
  VALIDO: "bg-lagoon/40",
  UTILIZADO: "bg-mustard/60",
  CANCELADA: "bg-blush/50",
  CANCELADO: "bg-blush/50",
  ENCERRADA: "bg-ink/10",
  ADMIN: "bg-coral/50",
  OPERADOR: "bg-mustard/60",
  CLIENTE: "bg-lagoon/40",
};

export function Etiqueta({ valor, children }) {
  return (
    <span className={`inline-flex rounded-full border-2 border-ink px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-retro text-ink ${STATUS[valor] || "bg-cream"}`}>
      {children || valor}
    </span>
  );
}

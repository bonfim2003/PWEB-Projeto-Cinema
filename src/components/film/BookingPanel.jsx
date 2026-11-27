import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, LogIn, Minus, Plus, ShieldCheck, Ticket } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/lib/AuthContext";
import { LIMITE_INGRESSOS, formatarDataLonga, formatarHora } from "@/lib/evento";

export default function BookingPanel({ sessao, area, onConfirmada }) {
  const { user } = useAuth();
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const maximo = Math.min(LIMITE_INGRESSOS, Math.max(0, Number(area?.vagas) || 0));
  const voltarPara = `/sessao/${sessao.id}`;

  const ajustar = (delta) => setQuantidade((atual) => Math.min(maximo, Math.max(1, atual + delta)));

  const confirmar = async (event) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resultado = await api.reservas.criar({ sessionId: sessao.id, sessionAreaId: area.id, quantidade });
      onConfirmada(resultado);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-ink bg-card p-7 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-mustard">
          <LogIn className="h-5 w-5 text-ink" />
        </span>
        <p className="mt-4 font-display text-2xl font-semibold text-ink">Entre para reservar</p>
        <p className="mt-2 max-w-xs text-sm text-ink/60">
          Os códigos dos ingressos ficam guardados na sua conta, em Meus ingressos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/cadastro?returnTo=${encodeURIComponent(voltarPara)}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block"
          >
            <Ticket className="h-4 w-4" />
            Criar conta
          </Link>
          <Link
            to={`/login?returnTo=${encodeURIComponent(voltarPara)}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-mustard/40"
          >
            <LogIn className="h-4 w-4" />
            Já tenho conta
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "CLIENTE") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/30 p-7 text-center">
        <p className="font-display text-xl text-ink/70">Reservas são feitas por clientes</p>
        <p className="mt-2 max-w-xs text-sm text-ink/50">
          Contas da produção e da portaria acompanham as reservas pelo painel.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={confirmar} className="flex h-full flex-col rounded-2xl border-2 border-ink bg-card p-5 sm:p-7">
      <p className="font-serif text-lg italic text-plum">sua reserva</p>
      <h3 className="mt-0.5 font-display text-2xl font-semibold text-ink">{area.name}</h3>
      {area.description && <p className="mt-1 text-sm text-ink/60">{area.description}</p>}

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Quantos ingressos?</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => ajustar(-1)}
            disabled={quantidade <= 1}
            aria-label="Diminuir quantidade de ingressos"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-mustard disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-display text-2xl font-semibold text-ink" aria-live="polite">
            {quantidade}
          </span>
          <button
            type="button"
            onClick={() => ajustar(1)}
            disabled={quantidade >= maximo}
            aria-label="Aumentar quantidade de ingressos"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-mustard disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="text-xs text-ink/50">até {LIMITE_INGRESSOS} por sessão, somando suas reservas</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-ink/25 bg-cream/70 p-4">
        <p className="text-[10px] uppercase tracking-retro text-ink/45">Resumo</p>
        <dl className="mt-2 space-y-1.5 text-sm">
          {[
            ["Filme", sessao.title],
            ["Sessão", `${formatarDataLonga(sessao.starts_at)}, ${formatarHora(sessao.starts_at)}`],
            ["Local", sessao.local],
            ["Área", area.name],
            ["Titular", user.name],
          ].map(([termo, valor]) => (
            <div key={termo} className="flex justify-between gap-4">
              <dt className="text-ink/55">{termo}</dt>
              <dd className="text-right font-medium text-ink">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {erro && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border-2 border-coral bg-coral/20 px-3 py-2 text-sm text-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || maximo === 0}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-4 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
        {enviando ? "Reservando..." : `Reservar ${quantidade} ${quantidade === 1 ? "ingresso" : "ingressos"}`}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink/45">
        <ShieldCheck className="h-3.5 w-3.5" />
        Sem pagamento. Cada ingresso recebe um código de entrada.
      </p>
    </form>
  );
}

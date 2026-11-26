import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/lib/AuthContext";
import { formatarDataLonga } from "@/lib/evento";
import {
  Minus,
  Plus,
  Loader2,
  Ticket,
  AlertCircle,
  LogIn,
  ShieldCheck,
} from "lucide-react";

export default function BookingPanel({ sessao, setor, onConfirmada }) {
  const { user } = useAuth();
  const [quantidade, setQuantidade] = useState(1);
  const [nome, setNome] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const maximo = Math.min(6, Number(setor?.vagas_disponiveis) || 0);
  const voltarPara =
    typeof window !== "undefined" ? window.location.pathname + "#reserva" : "/";

  const ajustar = (delta) => {
    setQuantidade((atual) => Math.min(maximo, Math.max(1, atual + delta)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const reserva = await api.reservas.criar({
        sessao_id: sessao.id,
        setor_id: setor.id,
        nome,
        email,
        quantidade,
      });
      onConfirmada(reserva);
    } catch (err) {
      setErro(
        err?.response?.data?.error ||
          err?.message ||
          "Não foi possível concluir a reserva. Tente novamente."
      );
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
        <p className="mt-4 font-display text-2xl font-semibold text-ink">
          Entre para reservar
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink/60">
          As reservas ficam vinculadas à sua conta para você consultar e
          gerenciar os ingressos depois.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to={`/register?returnTo=${encodeURIComponent(voltarPara)}`}
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
        <p className="mt-3 text-xs text-ink/45">
          {setor.nome} · {maximo} lugares disponíveis
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col rounded-2xl border-2 border-ink bg-card p-5 sm:p-7"
    >
      <p className="font-serif text-lg italic text-plum">sua reserva</p>
      <h3 className="mt-0.5 font-display text-2xl font-semibold text-ink">
        {setor.nome} · {setor.tipo}
      </h3>
      <p className="mt-1 text-sm text-ink/60">{setor.descricao}</p>

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
          <span className="w-12 text-center font-display text-2xl font-semibold text-ink">
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
          <span className="text-xs text-ink/50">máx. {maximo} por reserva</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="nome" className="text-sm font-semibold text-ink">
            Nome completo
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
            minLength={3}
            placeholder="Como você quer ser chamado"
            className="mt-2 w-full rounded-xl border-2 border-ink/25 bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="voce@email.com"
            className="mt-2 w-full rounded-xl border-2 border-ink/25 bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-ink/25 bg-cream/70 p-4">
        <p className="text-[10px] uppercase tracking-retro text-ink/45">
          Resumo da reserva
        </p>
        <dl className="mt-2 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Filme</dt>
            <dd className="text-right font-medium text-ink">
              {sessao.filme_titulo}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Sessão</dt>
            <dd className="text-right text-ink">
              {formatarDataLonga(sessao.data)} · {sessao.horario}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Setor</dt>
            <dd className="text-right text-ink">{setor.nome}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/55">Ingressos</dt>
            <dd className="text-right font-medium text-ink">
              {quantidade} {quantidade === 1 ? "lugar" : "lugares"}
            </dd>
          </div>
        </dl>
      </div>

      {erro && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-coral bg-coral/20 px-3 py-2 text-sm text-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || maximo === 0}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-4 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          <>
            <Ticket className="h-4 w-4" />
            Confirmar reserva gratuita
          </>
        )}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink/45">
        <ShieldCheck className="h-3.5 w-3.5" />
        Sem pagamento. Guarde o código gerado para entrar no evento.
      </p>
    </form>
  );
}
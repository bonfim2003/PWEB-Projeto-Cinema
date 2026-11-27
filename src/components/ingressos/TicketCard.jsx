import { useState } from "react";
import { CalendarDays, Clock3, Loader2, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import Tape from "@/components/decor/Tape";
import CodigoIngresso from "@/components/ingressos/CodigoIngresso";
import { formatarDataLonga, formatarHora, podeCancelar } from "@/lib/evento";

/** Uma reserva: dados da sessão à esquerda, os códigos (um por ingresso) à direita. */
export default function TicketCard({ reserva, onCancelar }) {
  const [cancelando, setCancelando] = useState(false);
  const ativa = reserva.status === "ATIVA";
  const algumUsado = reserva.ingressos.some((t) => t.status === "UTILIZADO");
  const cancelavel = ativa && !algumUsado && podeCancelar(reserva.starts_at);

  const cancelar = async () => {
    const qtd = reserva.ingressos.length;
    if (!window.confirm(`Cancelar esta reserva inteira (${qtd} ${qtd === 1 ? "ingresso" : "ingressos"})? As vagas voltam para outras pessoas.`))
      return;
    setCancelando(true);
    try {
      await onCancelar(reserva.id);
    } finally {
      setCancelando(false);
    }
  };

  return (
    <article
      className={`relative grid overflow-hidden rounded-2xl border-2 border-ink bg-card md:grid-cols-[150px_1fr_minmax(250px,auto)] ${
        ativa ? "" : "opacity-70"
      }`}
    >
      <div className="relative border-b-2 border-dashed border-ink/25 bg-mustard/20 p-4 md:border-b-0 md:border-r-2">
        <Tape tone="mustard" className="-top-2 left-6 -rotate-6" />
        <Image
          src={reserva.banner_url}
          alt={`Pôster de ${reserva.title}`}
          className="mx-auto aspect-[2/3] w-24 border-2 border-ink object-cover md:w-full"
        />
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border-2 border-ink px-3 py-0.5 text-[10px] font-semibold uppercase tracking-retro ${
              ativa ? "bg-lagoon/40" : "bg-blush/50"
            }`}
          >
            {ativa ? "Reserva ativa" : "Cancelada"}
          </span>
          <span className="text-xs text-ink/55">{reserva.area}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{reserva.title}</h3>
        <dl className="mt-4 space-y-2 text-sm text-ink/75">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            {formatarDataLonga(reserva.starts_at)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0" />
            {formatarHora(reserva.starts_at)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {reserva.local}
            {reserva.address ? `, ${reserva.address}` : ""}
          </div>
        </dl>

        {reserva.sessao_status === "CANCELADA" && (
          <p className="mt-4 rounded-xl border-2 border-ink/20 bg-blush/30 px-3 py-2 text-sm text-ink">
            Sessão cancelada pela produção. Motivo: {reserva.cancel_reason}
          </p>
        )}

        {cancelavel && (
          <button
            type="button"
            onClick={cancelar}
            disabled={cancelando}
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-50"
          >
            {cancelando && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Cancelar reserva
          </button>
        )}
        {ativa && !cancelavel && !algumUsado && (
          <p className="mt-5 text-xs text-ink/50">O cancelamento fecha 2 horas antes da sessão.</p>
        )}
      </div>

      <div className="flex flex-col justify-center gap-3 border-t-2 border-dashed border-ink/25 bg-cream p-5 md:border-l-2 md:border-t-0">
        <p className="text-xs font-semibold text-ink/60">
          {reserva.ingressos.length === 1 ? "Código de entrada" : `${reserva.ingressos.length} códigos de entrada`}
        </p>
        <ul className="space-y-2">
          {reserva.ingressos.map((t) => (
            <li key={t.id}>
              <CodigoIngresso codigo={t.code} status={t.status} />
            </li>
          ))}
        </ul>
        {ativa && <p className="text-xs text-ink/45">Mostre na portaria. Cada código vale uma entrada.</p>}
      </div>
    </article>
  );
}

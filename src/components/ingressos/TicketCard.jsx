import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Copy, Check, Ticket } from "lucide-react";
import { Image } from "@/components/ui/image";
import QrIlustrativo from "@/components/QrIlustrativo";
import Tape from "@/components/decor/Tape";
import { formatarDataLonga } from "@/lib/evento";

export default function TicketCard({ reserva, destaque }) {
  const [copiado, setCopiado] = useState(false);
  const cancelada = reserva.status === "cancelada";

  const copiar = async () => {
    await navigator.clipboard.writeText(reserva.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <article
      className={`relative grid overflow-hidden rounded-2xl border-2 border-ink bg-card md:grid-cols-[170px_1fr_240px] ${
        destaque ? "shadow-block" : ""
      } ${cancelada ? "opacity-60" : ""}`}
    >
      <div className="relative border-b-2 border-dashed border-ink/25 bg-mustard/20 p-4 md:border-b-0 md:border-r-2">
        <Tape tone="mustard" className="-top-2 left-6 -rotate-6" />
        <Image
          src={reserva.filme_poster}
          alt={`Pôster de ${reserva.filme_titulo}`}
          className="mx-auto aspect-[2/3] w-28 border-2 border-ink object-cover md:w-full"
        />
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border-2 border-ink px-3 py-0.5 text-[10px] font-semibold uppercase tracking-retro ${
              cancelada ? "bg-blush/50" : "bg-lagoon/40"
            }`}
          >
            {cancelada ? "Cancelada" : "Confirmada"}
          </span>
          <span className="text-xs text-ink/50">
            {reserva.quantidade} {reserva.quantidade === 1 ? "lugar" : "lugares"} ·{" "}
            {reserva.setor_nome}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
          {reserva.filme_titulo}
        </h3>
        <dl className="mt-4 space-y-2 text-sm text-ink/75">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" />
            {formatarDataLonga(reserva.sessao_data)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0" />
            {reserva.sessao_horario}
          </div>
          {reserva.local && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {reserva.local}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0" />
            Titular: {reserva.nome}
          </div>
        </dl>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-ink/25 bg-cream p-5 md:border-l-2 md:border-t-0">
        <p className="text-[10px] uppercase tracking-retro text-ink/45">
          Código localizador
        </p>
        <button
          type="button"
          onClick={copiar}
          className="flex items-center gap-2 rounded-lg border-2 border-ink bg-card px-3 py-1.5 font-mono text-sm font-bold text-ink"
        >
          {reserva.codigo}
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        {!cancelada && (
          <div className="rounded-xl border-2 border-ink bg-card p-3">
            <QrIlustrativo codigo={reserva.codigo} className="h-28 w-28" />
          </div>
        )}
        <p className="text-center text-[10px] uppercase tracking-retro text-ink/45">
          Apresente na entrada
        </p>
      </div>
    </article>
  );
}
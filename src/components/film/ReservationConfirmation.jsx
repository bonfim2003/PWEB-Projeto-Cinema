import { Link } from "react-router-dom";
import { CalendarDays, Check, MapPin, Ticket } from "lucide-react";
import QrIlustrativo from "@/components/QrIlustrativo";
import { formatarDataLonga } from "@/lib/evento";
import Tape from "@/components/decor/Tape";

export default function ReservationConfirmation({ reserva, onNovaReserva }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-coral/25 shadow-block">
      <Tape tone="mustard" className="-top-2 left-10 -rotate-6" />

      <div className="flex items-center gap-3 border-b-2 border-dashed border-ink/30 px-6 py-5 sm:px-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-cream">
          <Check className="h-5 w-5 text-ink" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-retro text-ink/55">
            Reserva confirmada
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Nos vemos no gramado!
          </h3>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[10px] uppercase tracking-retro text-ink/50">
            Seu código de entrada
          </p>
          <p className="mt-1 font-display text-4xl font-bold tracking-wide text-ink sm:text-5xl">
            {reserva.codigo}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Guarde este código — ele também foi enviado para o e-mail da
            reserva. Apresente na entrada junto com o QR Code.
          </p>

          <dl className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                Filme
              </dt>
              <dd className="mt-1 font-display text-base font-semibold text-ink">
                {reserva.filme_titulo}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                Sessão
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                <CalendarDays className="h-4 w-4" />
                {formatarDataLonga(reserva.sessao_data)} · {reserva.sessao_horario}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                Setor
              </dt>
              <dd className="mt-1 font-semibold text-ink">{reserva.setor_nome}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                Ingressos
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                <Ticket className="h-4 w-4" />
                {reserva.quantidade}{" "}
                {reserva.quantidade === 1 ? "lugar" : "lugares"}
              </dd>
            </div>
            {reserva.local && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                  Local
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                  <MapPin className="h-4 w-4" />
                  {reserva.local}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="justify-self-start md:justify-self-end">
          <div className="rounded-xl border-2 border-ink bg-cream p-4">
            <QrIlustrativo codigo={reserva.codigo} className="h-40 w-40" />
            <p className="mt-3 max-w-[10rem] text-center text-[10px] uppercase tracking-retro text-ink/50">
              Apresente na entrada
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t-2 border-dashed border-ink/30 px-6 py-5 sm:px-10">
        <button
          type="button"
          onClick={onNovaReserva}
          className="rounded-full border-2 border-ink bg-cream px-6 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5"
        >
          Fazer outra reserva
        </button>
        <Link
          to="/"
          className="rounded-full border-2 border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Voltar à programação
        </Link>
      </div>
    </div>
  );
}
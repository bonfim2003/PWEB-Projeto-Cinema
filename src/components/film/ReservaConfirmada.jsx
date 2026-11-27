import { Link } from "react-router-dom";
import { Check, MapPin } from "lucide-react";
import Tape from "@/components/decor/Tape";
import CodigoIngresso from "@/components/ingressos/CodigoIngresso";
import { formatarDataLonga, formatarHora } from "@/lib/evento";

export default function ReservaConfirmada({ sessao, area, codigos, onNovaReserva }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-coral/25 shadow-block">
      <Tape tone="mustard" className="-top-2 left-10 -rotate-6" />

      <div className="flex items-center gap-3 border-b-2 border-dashed border-ink/30 px-6 py-5 sm:px-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-cream">
          <Check className="h-5 w-5 text-ink" />
        </span>
        <div>
          <p className="font-serif text-base italic text-plum">reserva confirmada</p>
          <h3 className="font-display text-2xl font-semibold text-ink">Nos vemos na sessão!</h3>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-ink">
            {codigos.length === 1 ? "Seu código de entrada" : `Seus ${codigos.length} códigos de entrada`}
          </p>
          <p className="mt-1 max-w-sm text-sm text-ink/60">
            Um código por pessoa. Na entrada, a portaria digita cada código e libera o acesso.
          </p>
          <ul className="mt-5 space-y-3">
            {codigos.map((codigo) => (
              <li key={codigo}>
                <CodigoIngresso codigo={codigo} grande />
              </li>
            ))}
          </ul>
        </div>

        <dl className="grid content-start gap-4 text-sm">
          <div>
            <dt className="text-ink/50">Filme</dt>
            <dd className="font-display text-lg font-semibold text-ink">{sessao.title}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Quando</dt>
            <dd className="text-ink">
              {formatarDataLonga(sessao.starts_at)}, {formatarHora(sessao.starts_at)}
            </dd>
          </div>
          <div>
            <dt className="text-ink/50">Onde</dt>
            <dd className="flex items-center gap-1.5 text-ink">
              <MapPin className="h-4 w-4" />
              {sessao.local} · {area.name}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3 border-t-2 border-dashed border-ink/30 px-6 py-5 sm:px-10">
        <Link
          to="/meus-ingressos"
          className="rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5"
        >
          Ver meus ingressos
        </Link>
        <button
          type="button"
          onClick={onNovaReserva}
          className="rounded-full border-2 border-ink bg-cream px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-mustard/40"
        >
          Reservar em outra área
        </button>
      </div>
    </div>
  );
}

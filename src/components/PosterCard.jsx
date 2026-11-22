import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import Tape from "@/components/decor/Tape";

export default function PosterCard({ filme }) {
  return (
    <Link
      to={filme.href ?? "/"}
      className="group block w-[212px] shrink-0 snap-start sm:w-[238px] lg:w-[252px]"
    >
      <div className="relative">
        <Tape
          tone={filme.fita || "mustard"}
          className="-top-3 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-3"
        />
        <div className="relative overflow-hidden border-2 border-ink bg-cream p-1.5 shadow-block-sm transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-block">
          <Image
            src={filme.poster}
            alt={`Pôster do filme ${filme.titulo}`}
            className="aspect-[2/3] w-full"
            fittingType="fill"
          />
          {filme.classificacao && (
            <span className="absolute right-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-ink bg-cream px-1.5 font-display text-[11px] font-bold text-ink">
              {filme.classificacao.replace(" anos", "")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-serif text-sm italic text-plum">{filme.genero}</p>
        <h3 className="mt-0.5 font-display text-xl font-semibold leading-tight text-ink transition-colors group-hover:text-coral">
          {filme.titulo}
        </h3>
        {filme.sessao && (
          <p className="mt-2 text-[11px] uppercase tracking-retro text-ink/55">
            {filme.sessao}
          </p>
        )}
        {filme.local && (
          <p className="mt-1 line-clamp-1 text-xs text-ink/40">{filme.local}</p>
        )}
      </div>
    </Link>
  );
}
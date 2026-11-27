import { nivelDisponibilidade } from "@/lib/evento";
import { Check, X } from "lucide-react";

const ESTILOS = {
  disponivel: "border-ink bg-cream hover:-translate-y-0.5",
  poucas: "border-ink bg-mustard/70 hover:-translate-y-0.5",
  esgotado: "border-ink/40 bg-ink/10 cursor-not-allowed",
  selecionado: "border-ink bg-coral -translate-y-0.5 shadow-block-sm",
};

const ETIQUETAS = { disponivel: "Disponível", poucas: "Poucas vagas", esgotado: "Esgotado" };

function AreaTile({ area, selecionado, onSelect, desabilitado }) {
  const nivel = nivelDisponibilidade(area);
  const esgotado = nivel === "esgotado";
  const estado = selecionado ? "selecionado" : nivel;
  const vagas = Math.max(0, Number(area.vagas) || 0);

  return (
    <button
      type="button"
      disabled={esgotado || desabilitado}
      onClick={() => onSelect(area)}
      aria-pressed={selecionado}
      aria-label={`${area.name}: ${vagas} de ${area.capacity} lugares disponíveis`}
      className={`group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:hover:translate-y-0 ${ESTILOS[estado]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base leading-tight text-ink">{area.name}</p>
          {area.description && <p className="mt-1 text-xs text-ink/55">{area.description}</p>}
        </div>
        {selecionado ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cream">
            <Check className="h-3.5 w-3.5 text-ink" />
          </span>
        ) : esgotado ? (
          <X className="h-4 w-4 shrink-0 text-ink/40" />
        ) : null}
      </div>

      <p className="mt-4 text-sm text-ink/70">
        {esgotado ? (
          <span className="font-semibold">Sem lugares</span>
        ) : (
          <>
            <span className="font-semibold text-ink">{vagas}</span> de {area.capacity} lugares
          </>
        )}
      </p>

      <span className="mt-3 inline-flex items-center rounded-full border border-ink/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-retro text-ink/70">
        {selecionado ? "Selecionada" : ETIQUETAS[nivel]}
      </span>
    </button>
  );
}

const LEGENDA = [
  { label: "Disponível", classe: "bg-cream" },
  { label: "Selecionada", classe: "bg-coral" },
  { label: "Poucas vagas", classe: "bg-mustard/70" },
  { label: "Esgotado", classe: "bg-ink/15" },
];

/** Mapa do espaço: a tela no topo e as áreas na ordem do local (a primeira fica mais perto). */
export default function SectorMap({ areas, selecionadaId, onSelect, desabilitado = false }) {
  const [primeira, ...demais] = areas;

  return (
    <div className="rounded-3xl border-2 border-ink bg-card p-5 sm:p-8">
      <div className="mx-auto max-w-sm rounded-xl border-2 border-ink bg-lagoon py-3 text-center">
        <p className="text-[10px] uppercase tracking-retro text-ink/70">Telão inflável</p>
        <p className="font-display text-sm text-ink">Tela</p>
      </div>

      <div className="mt-6 space-y-3 sm:space-y-4">
        {primeira && (
          <AreaTile area={primeira} selecionado={selecionadaId === primeira.id} onSelect={onSelect} desabilitado={desabilitado} />
        )}
        {demais.length > 0 && (
          <div className={`grid gap-3 sm:gap-4 ${demais.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {demais.map((area) => (
              <AreaTile key={area.id} area={area} selecionado={selecionadaId === area.id} onSelect={onSelect} desabilitado={desabilitado} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-ink/10 pt-4">
        {LEGENDA.map((item) => (
          <span key={item.label} className="flex items-center gap-2 text-[11px] uppercase tracking-retro text-ink/55">
            <span className={`h-3 w-3 rounded-sm border border-ink ${item.classe}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

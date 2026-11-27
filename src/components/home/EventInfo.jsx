import { Image } from "@/components/ui/image";
import { plateiaImage } from "@/data/hero";
import Tape from "@/components/decor/Tape";
import Sticker from "@/components/decor/Sticker";
import { MapPin, Clock3, Accessibility, Backpack } from "lucide-react";

const informacoes = [
  {
    icon: Clock3,
    titulo: "Horários",
    texto: "Os portões abrem 1 hora antes de cada sessão. A validação dos códigos começa assim que a portaria abre.",
  },
  {
    icon: Backpack,
    titulo: "O que levar",
    texto: "Manta, canga ou almofada, repelente e uma lanterna pequena. Cadeiras de praia são bem-vindas nas áreas de gramado.",
  },
  {
    icon: Accessibility,
    titulo: "Acessibilidade",
    texto: "Todos os locais têm acesso sem degraus até a área frontal e banheiros adaptados.",
  },
];

export default function EventInfo({ locais = [] }) {
  return (
    <section
      id="evento"
      className="scroll-mt-24 border-t-2 border-ink bg-paper/70 px-5 py-16 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="rotate-[-2deg]">
            <Tape tone="mustard" className="-top-3 left-12 -rotate-3" />
            <div className="overflow-hidden border-2 border-ink bg-cream p-2 shadow-block">
              <Image
                src={plateiaImage}
                alt="Plateia sentada em mantas assistindo ao filme ao ar livre"
                className="h-[300px] w-full sm:h-[380px]"
              />
            </div>
          </div>
          <Sticker
            tone="lagoon"
            className="absolute -bottom-6 -right-4 h-24 w-24 rotate-6"
          >
            Portões<br />1h antes
          </Sticker>
        </div>

        <div>
          <p className="font-serif text-xl italic text-plum">o evento</p>
          <h2 className="mt-1 font-display text-4xl font-semibold leading-[0.95] text-ink sm:text-5xl">
            Onde a praça
            <br />
            vira sala de cinema
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65">
            O telão circula pela cidade. Cada local é dividido em áreas com
            capacidade própria, e a reserva garante seu lugar em uma delas.
          </p>

          {locais.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {locais.map((local) => (
                <li key={local.id} className="rounded-xl border-2 border-ink bg-cream p-4">
                  <p className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <MapPin className="h-4 w-4 text-coral" />
                    {local.name}
                  </p>
                  {local.address && <p className="mt-1 text-sm text-ink/60">{local.address}</p>}
                  <p className="mt-2 text-xs text-ink/50">
                    {local.areas.map((a) => a.name).join(", ")} ·{" "}
                    {local.areas.reduce((t, a) => t + a.capacity, 0)} lugares
                  </p>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {informacoes.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="border-t-2 border-ink/15 pt-3">
                <dt className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                  <Icon className="h-4 w-4 text-coral" />
                  {titulo}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink/60">
                  {texto}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PosterCard from "@/components/PosterCard";
import SectionHeading from "@/components/decor/SectionHeading";
import Marquee from "@/components/decor/Marquee";

export default function FilmCarousel({ filmes, locais = [] }) {
  const trackRef = useRef(null);

  const scrollByCard = (direction) => {
    const node = trackRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.72;
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <>
      <Marquee
        items={[
          "cinema ao ar livre",
          "entrada gratuita",
          ...locais.map((l) => l.name.toLowerCase()),
          "um código por ingresso",
          "temporada 2026",
        ]}
      />

      <section
        id="programacao"
        className="scroll-mt-24 py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[1360px] px-5 lg:px-10">
          <SectionHeading
            eyebrow="em cartaz"
            titulo="Filmes da temporada"
            descricao="Clássicos que definiram os anos 80, escolhidos para a tela grande. Toque no pôster para ver a próxima sessão."
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  aria-label="Filme anterior"
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink transition-all hover:bg-mustard active:translate-y-px"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  aria-label="Próximo filme"
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink transition-all hover:bg-mustard active:translate-y-px"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            }
          />

          {filmes.length === 0 ? (
            <p className="mt-10 rounded-2xl border-2 border-dashed border-ink/25 p-8 text-center text-sm text-ink/55">
              Nenhum filme em cartaz no momento. Volte em breve para conferir a
              nova programação.
            </p>
          ) : (
            <div
              ref={trackRef}
              className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-7 overflow-x-auto pb-6 pt-3 lg:gap-9"
            >
              {filmes.map((filme, indice) => (
                <PosterCard
                  key={filme.id}
                  filme={{
                    ...filme,
                    fita: ["mustard", "coral", "lagoon", "blush"][indice % 4],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
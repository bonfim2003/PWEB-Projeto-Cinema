import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/services/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSection from "@/components/home/HeroSection";
import FilmCarousel from "@/components/home/FilmCarousel";
import WeekSchedule from "@/components/home/WeekSchedule";
import AboutEvent from "@/components/home/AboutEvent";
import EventInfo from "@/components/home/EventInfo";
import { formatarData, formatarHora } from "@/lib/evento";

/** Um card por filme, apontando para a próxima sessão dele. */
function cardsDeFilmes(sessoes) {
  const vistos = new Map();
  for (const s of sessoes) {
    if (vistos.has(s.movie_id)) continue;
    vistos.set(s.movie_id, {
      id: s.movie_id,
      titulo: s.title,
      genero: s.genre || "Sessão especial",
      classificacao: s.rating,
      poster: s.banner_url,
      sessao: `${formatarData(s.starts_at)} · ${formatarHora(s.starts_at)}`,
      local: s.local,
      href: `/sessao/${s.id}`,
    });
  }
  return [...vistos.values()];
}

export default function Home() {
  const [sessoes, setSessoes] = useState(null);
  const [locais, setLocais] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.sessoes.listar(), api.locais.listar()])
      .then(([listaSessoes, listaLocais]) => {
        setSessoes(listaSessoes);
        setLocais(listaLocais);
      })
      .catch((e) => setErro(e.message));
  }, []);

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <HeroSection />

        {erro ? (
          <p className="mx-auto my-16 max-w-xl rounded-2xl border-2 border-coral bg-coral/20 p-6 text-center text-sm text-ink">
            Não foi possível carregar a programação: {erro}
          </p>
        ) : !sessoes ? (
          <div className="flex justify-center border-t-2 border-ink/10 py-24">
            <Loader2 className="h-7 w-7 animate-spin text-ink/40" />
          </div>
        ) : (
          <>
            <FilmCarousel filmes={cardsDeFilmes(sessoes)} locais={locais} />
            <WeekSchedule sessoesIniciais={sessoes} locais={locais} />
          </>
        )}

        <AboutEvent />
        <EventInfo locais={locais} />
      </main>
      <SiteFooter />
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { format } from "date-fns";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSection from "@/components/home/HeroSection";
import FilmCarousel from "@/components/home/FilmCarousel";
import WeekSchedule from "@/components/home/WeekSchedule";
import AboutEvent from "@/components/home/AboutEvent";
import EventInfo from "@/components/home/EventInfo";
import { formatarData } from "@/lib/evento";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [carregando, setCarregando] = useState(true);
  const [filmes, setFilmes] = useState([]);
  const [cards, setCards] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [proxima, setProxima] = useState(null);

  useEffect(() => {
    let ativo = true;
    const hoje = format(new Date(), "yyyy-MM-dd");

    (async () => {
      const [listaFilmes, listaSessoes] = await Promise.all([
        api.filmes.list(),
        api.sessoes.list({ status: "ativa" }),
      ]);
      if (!ativo) return;

      const futuras = (listaSessoes || []).filter((sessao) => sessao.data >= hoje);

      const primeiraPorFilme = new Map();
      futuras.forEach((sessao) => {
        if (sessao.filme_id && !primeiraPorFilme.has(sessao.filme_id)) {
          primeiraPorFilme.set(sessao.filme_id, sessao);
        }
      });

      const montados = [];
      primeiraPorFilme.forEach((sessao, filmeId) => {
        const filme = listaFilmes.find((item) => item.id === filmeId);
        if (!filme) return;
        montados.push({
          id: filme.id,
          titulo: filme.titulo,
          genero: filme.genero || "Sessão especial",
          classificacao: filme.classificacao,
          poster: filme.poster_url,
          sessao: `${formatarData(sessao.data)} · ${sessao.horario}`,
          local: sessao.local,
          href: `/filme/${filme.id}`,
        });
      });

      const comFilme = futuras.filter((sessao) =>
        listaFilmes.some((filme) => filme.id === sessao.filme_id)
      );

      setFilmes(listaFilmes);
      setSessoes(futuras);
      setCards(montados);
      setProxima(
        comFilme[0]
          ? {
              filmeTitulo: comFilme[0].filme_titulo,
              data: formatarData(comFilme[0].data),
              horario: comFilme[0].horario,
              href: `/filme/${comFilme[0].filme_id}`,
            }
          : null
      );
      setCarregando(false);
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <HeroSection proxima={proxima} />

        {carregando ? (
          <div className="flex justify-center border-t-2 border-ink/10 py-24">
            <Loader2 className="h-7 w-7 animate-spin text-ink/40" />
          </div>
        ) : (
          <>
            <FilmCarousel filmes={cards} />
            <WeekSchedule sessoes={sessoes} filmes={filmes} />
          </>
        )}

        <AboutEvent />
        <EventInfo />
      </main>
      <SiteFooter />
    </div>
  );
}

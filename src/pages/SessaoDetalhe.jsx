import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, Loader2, MapPin, Users } from "lucide-react";
import { api } from "@/services/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Image } from "@/components/ui/image";
import TrailerEmbed from "@/components/film/TrailerEmbed";
import SectorMap from "@/components/film/SectorMap";
import BookingPanel from "@/components/film/BookingPanel";
import ReservaConfirmada from "@/components/film/ReservaConfirmada";
import Tape from "@/components/decor/Tape";
import Sticker from "@/components/decor/Sticker";
import { formatarData, formatarDataLonga, formatarHora, vagasTotais } from "@/lib/evento";

export default function SessaoDetalhe() {
  const { id } = useParams();
  const [sessao, setSessao] = useState(null);
  const [outras, setOutras] = useState([]);
  const [areaSel, setAreaSel] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const dados = await api.sessoes.detalhe(id);
    setSessao(dados);
    setAreaSel((atual) => (atual ? dados.areas.find((a) => a.id === atual.id) || null : null));
    return dados;
  }, [id]);

  useEffect(() => {
    setSessao(null);
    setConfirmada(null);
    setAreaSel(null);
    setErro("");
    carregar()
      .then((dados) => api.sessoes.listar({ movieId: dados.movie_id }))
      .then((lista) => setOutras(lista.filter((s) => String(s.id) !== String(id))))
      .catch((e) => setErro(e.message));
  }, [id, carregar]);

  const aoConfirmar = async ({ codigos }) => {
    setConfirmada({ area: areaSel, codigos });
    await carregar(); // atualiza as vagas na tela
    document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const escolherArea = (area) => {
    setAreaSel(area);
    if (window.innerWidth < 1024) {
      document.getElementById("painel-reserva")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (erro || !sessao) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          {erro ? (
            <>
              <h1 className="font-display text-3xl text-ink">{erro}</h1>
              <Link to="/#agenda" className="mt-6 inline-flex rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink">
                Voltar à programação
              </Link>
            </>
          ) : (
            <Loader2 className="h-7 w-7 animate-spin text-ink/40" />
          )}
        </div>
      </div>
    );
  }

  const encerrada = sessao.status === "CANCELADA" || new Date(sessao.starts_at) <= new Date();
  const vagas = vagasTotais(sessao.areas);

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />

      <main className="mx-auto max-w-[1360px] px-5 py-10 lg:px-10 lg:py-14">
        <Link to="/#agenda" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a programação
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[310px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="relative mx-auto max-w-[280px] lg:max-w-none">
              <Tape tone="coral" className="-top-3 left-8 -rotate-6" />
              <div className="rotate-[-1.5deg] border-2 border-ink bg-cream p-2 shadow-block">
                <Image src={sessao.banner_url} alt={`Pôster do filme ${sessao.title}`} className="aspect-[2/3] w-full" />
              </div>
              <Sticker tone="mustard" className="absolute -bottom-5 -right-3 h-[74px] w-[74px] rotate-6">
                {sessao.rating || "Livre"}
              </Sticker>
            </div>

            <dl className="mt-10 divide-y divide-ink/10 border-y-2 border-ink/15 text-sm">
              {[
                ["Duração", sessao.duration ? `${sessao.duration} min` : "—"],
                ["Ano", sessao.year || "—"],
                ["Direção", sessao.director || "—"],
                ["Gênero", sessao.genre || "—"],
              ].map(([termo, valor]) => (
                <div key={termo} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-ink/50">{termo}</dt>
                  <dd className="text-right font-medium text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div>
            <p className="font-serif text-xl italic text-plum">
              {[sessao.genre, sessao.year].filter(Boolean).join(", ") || "Sessão especial"}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold leading-[0.92] text-ink sm:text-5xl lg:text-6xl">
              {sessao.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/75">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatarDataLonga(sessao.starts_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatarHora(sessao.starts_at)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {sessao.local}
                {sessao.address ? `, ${sessao.address}` : ""}
              </span>
            </div>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">{sessao.synopsis}</p>

            <div className="mt-9 max-w-3xl">
              <TrailerEmbed url={sessao.trailer_url} titulo={sessao.title} />
            </div>

            {outras.length > 0 && (
              <div className="mt-11">
                <h2 className="font-display text-2xl font-semibold text-ink">Outras sessões deste filme</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {outras.map((s) => (
                    <Link
                      key={s.id}
                      to={`/sessao/${s.id}`}
                      className="flex flex-wrap items-center gap-x-5 gap-y-1 border-2 border-ink/20 bg-card px-4 py-3 transition-all hover:border-ink"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <CalendarDays className="h-4 w-4" />
                        {formatarData(s.starts_at)}, {formatarHora(s.starts_at)}
                      </span>
                      <span className="flex w-full items-center gap-2 text-xs text-ink/55">
                        <MapPin className="h-3.5 w-3.5" />
                        {s.local}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <section id="reserva" className="mt-12 scroll-mt-28">
              {encerrada ? (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-ink bg-blush/30 p-6">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                  <div>
                    <p className="font-display text-xl text-ink">
                      {sessao.status === "CANCELADA" ? "Sessão cancelada" : "Reservas encerradas"}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">
                      {sessao.status === "CANCELADA"
                        ? `Motivo: ${sessao.cancel_reason}. Se houver nova data, ela aparece na programação.`
                        : "Esta sessão já começou."}
                    </p>
                  </div>
                </div>
              ) : confirmada ? (
                <ReservaConfirmada
                  sessao={sessao}
                  area={confirmada.area}
                  codigos={confirmada.codigos}
                  onNovaReserva={() => {
                    setConfirmada(null);
                    setAreaSel(null);
                  }}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink/15 pb-4">
                    <div>
                      <p className="font-serif text-lg italic text-plum">reserva gratuita</p>
                      <h2 className="font-display text-3xl font-semibold text-ink">Escolha sua área</h2>
                      <p className="mt-2 max-w-md text-sm text-ink/60">
                        Não há lugares numerados: cada área tem capacidade própria nesta sessão.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2 text-xs font-semibold text-ink">
                      <Users className="h-4 w-4" />
                      {vagas} lugares disponíveis
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <SectorMap areas={sessao.areas} selecionadaId={areaSel?.id} onSelect={escolherArea} />
                    <div id="painel-reserva" className="scroll-mt-28">
                      {areaSel ? (
                        <BookingPanel key={areaSel.id} sessao={sessao} area={areaSel} onConfirmada={aoConfirmar} />
                      ) : (
                        <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 p-8 text-center">
                          <p className="font-display text-xl text-ink/70">Nenhuma área selecionada</p>
                          <p className="mt-2 max-w-xs text-sm text-ink/50">
                            Escolha uma área no mapa para liberar a reserva.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

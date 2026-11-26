import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Image } from "@/components/ui/image";
import TrailerEmbed from "@/components/film/TrailerEmbed";
import SectorMap from "@/components/film/SectorMap";
import BookingPanel from "@/components/film/BookingPanel";
import ReservationConfirmation from "@/components/film/ReservationConfirmation";
import Tape from "@/components/decor/Tape";
import Sticker from "@/components/decor/Sticker";
import { formatarDataLonga } from "@/lib/evento";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Loader2, Users } from "lucide-react";

export default function FilmeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filme, setFilme] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [sessaoSel, setSessaoSel] = useState(null);
  const [setores, setSetores] = useState([]);
  const [setorSel, setSetorSel] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    (async () => {
      try {
        const [filmeDados, listaSessoes] = await Promise.all([
          api.filmes.get(id),
          api.sessoes.list({ filme_id: id, status: "ativa" }),
        ]);
        if (!ativo) return;
        setFilme(filmeDados);
        setSessoes(listaSessoes || []);
        setSessaoSel(listaSessoes?.[0] || null);
      } catch (e) {
        if (ativo) setErro("Não encontramos este filme na programação.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (!sessaoSel) {
      setSetores([]);
      return;
    }
    let ativo = true;
    setSetorSel(null);
    api.setores.listBySessao(sessaoSel.id).then((lista) => {
      if (ativo) setSetores(lista || []);
    });
    return () => {
      ativo = false;
    };
  }, [sessaoSel]);

  const handleSelecionarSetor = (setor) => {
    setSetorSel(setor);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      document
        .getElementById("painel-reserva")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleConfirmada = (novaReserva) => {
    navigate(`/meus-ingressos?nova=${encodeURIComponent(novaReserva.codigo)}`);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-ink/40" />
        </div>
      </div>
    );
  }

  if (erro || !filme) {
    return (
      <div className="min-h-screen bg-cream">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl text-ink">{erro}</h1>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink"
          >
            Voltar à programação
          </Link>
        </div>
      </div>
    );
  }

  const sessaoAtual = sessaoSel || sessoes[0];
  const vagasDaSessao = setores.reduce(
    (total, setor) => total + Math.max(0, Number(setor.vagas_disponiveis) || 0),
    0
  );

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />

      <main className="mx-auto max-w-[1360px] px-5 py-10 lg:px-10 lg:py-14">
        <Link
          to="/#programacao"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a programação
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[310px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="relative mx-auto max-w-[280px] lg:max-w-none">
              <Tape tone="coral" className="-top-3 left-8 -rotate-6" />
              <div className="rotate-[-1.5deg] border-2 border-ink bg-cream p-2 shadow-block">
                <Image
                  src={filme.poster_url}
                  alt={`Pôster do filme ${filme.titulo}`}
                  className="aspect-[2/3] w-full"
                />
              </div>
              <Sticker
                tone="mustard"
                className="absolute -bottom-5 -right-3 h-[74px] w-[74px] rotate-6"
              >
                {filme.classificacao || "Livre"}
              </Sticker>
            </div>

            <dl className="mt-10 divide-y divide-ink/10 border-y-2 border-ink/15 text-sm">
              {[
                ["Duração", filme.duracao ? `${filme.duracao} min` : "—"],
                ["Ano", filme.ano || "—"],
                ["Direção", filme.diretor || "—"],
                ["Gênero", filme.genero || "—"],
              ].map(([termo, valor]) => (
                <div key={termo} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[10px] uppercase tracking-retro text-ink/45">
                    {termo}
                  </dt>
                  <dd className="text-right font-medium text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div>
            <p className="font-serif text-xl italic text-plum">
              {filme.genero || "Sessão especial"} · {filme.ano}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold leading-[0.92] text-ink sm:text-5xl lg:text-6xl">
              {filme.titulo}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">
              {filme.sinopse}
            </p>

            <div className="mt-9 max-w-3xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-retro text-ink/45">
                  Trailer
                </p>
                <p className="font-serif text-sm italic text-ink/45">
                  aperte o play
                </p>
              </div>
              <TrailerEmbed url={filme.trailer_url} titulo={filme.titulo} />
            </div>

            <div className="mt-11">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Sessões desta temporada
              </h2>
              {sessoes.length === 0 ? (
                <p className="mt-3 rounded-2xl border-2 border-dashed border-ink/25 p-5 text-sm text-ink/60">
                  Nenhuma sessão agendada para este filme no momento.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sessoes.map((sessao) => {
                    const ativa = sessaoAtual?.id === sessao.id;
                    return (
                      <button
                        key={sessao.id}
                        type="button"
                        onClick={() => setSessaoSel(sessao)}
                        className={`flex flex-wrap items-center gap-x-5 gap-y-2 border-2 px-4 py-3 text-left transition-all ${
                          ativa
                            ? "border-ink bg-lagoon/30 shadow-block-sm"
                            : "border-ink/20 bg-card hover:border-ink"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <CalendarDays className="h-4 w-4" />
                          {formatarDataLonga(sessao.data)}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-ink/65">
                          <Clock3 className="h-4 w-4" />
                          {sessao.horario}
                        </span>
                        <span className="flex w-full items-center gap-2 text-xs text-ink/50">
                          <MapPin className="h-3.5 w-3.5" />
                          {sessao.local}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <section id="reserva" className="mt-12 scroll-mt-28">
              {reserva ? (
                <ReservationConfirmation
                  reserva={reserva}
                  onNovaReserva={() => setReserva(null)}
                />
              ) : !sessaoAtual ? (
                <div className="rounded-2xl border-2 border-dashed border-ink/25 p-10 text-center">
                  <p className="font-display text-xl text-ink/70">
                    Reservas em breve
                  </p>
                  <p className="mt-2 text-sm text-ink/50">
                    Este filme ainda não tem sessão confirmada. Acompanhe a
                    programação para saber quando os setores abrem.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink/15 pb-4">
                    <div>
                      <p className="font-serif text-lg italic text-plum">
                        reserva gratuita
                      </p>
                      <h2 className="font-display text-3xl font-semibold text-ink">
                        Escolha seu setor
                      </h2>
                      <p className="mt-2 max-w-md text-sm text-ink/60">
                        O espaço não tem assentos numerados — cada setor tem
                        capacidade própria por sessão.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-2 text-xs font-semibold text-ink">
                      <Users className="h-4 w-4" />
                      {vagasDaSessao} lugares disponíveis
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <SectorMap
                      setores={setores}
                      selecionadoId={setorSel?.id}
                      onSelect={handleSelecionarSetor}
                    />
                    <div id="painel-reserva" className="scroll-mt-28">
                      {setorSel && sessaoAtual ? (
                        <BookingPanel
                          key={`${sessaoAtual.id}-${setorSel.id}`}
                          sessao={sessaoAtual}
                          setor={setorSel}
                          onConfirmada={handleConfirmada}
                        />
                      ) : (
                        <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 p-8 text-center">
                          <p className="font-display text-xl text-ink/70">
                            Nenhum setor selecionado
                          </p>
                          <p className="mt-2 max-w-xs text-sm text-ink/50">
                            Escolha um setor no mapa ao lado para liberar a
                            reserva dos ingressos.
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
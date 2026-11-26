import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Image } from "@/components/ui/image";
import SectionHeading from "@/components/decor/SectionHeading";
import { ArrowRight, CalendarOff, Clock3, MapPin } from "lucide-react";

export default function WeekSchedule({ sessoes = [], filmes = [] }) {
  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const totalDias = useMemo(() => {
    if (!sessoes.length) return 21;
    const ultima = sessoes.reduce(
      (maior, sessao) => (sessao.data > maior ? sessao.data : maior),
      ""
    );
    if (!ultima) return 21;
    const diferenca = differenceInCalendarDays(parseISO(ultima), hoje);
    return Math.min(42, Math.max(21, diferenca + 1));
  }, [sessoes, hoje]);

  const dias = useMemo(
    () => Array.from({ length: totalDias }, (_, i) => addDays(hoje, i)),
    [hoje, totalDias]
  );

  const sessoesDoDia = (dia) =>
    sessoes.filter((sessao) => sessao.data === format(dia, "yyyy-MM-dd"));

  const primeiroComSessao = useMemo(
    () => dias.find((dia) => sessoesDoDia(dia).length > 0) || dias[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dias, sessoes]
  );

  const [selecionado, setSelecionado] = useState(format(primeiroComSessao, "yyyy-MM-dd"));

  const diaSelecionado = dias.find((dia) => format(dia, "yyyy-MM-dd") === selecionado);
  const lista = diaSelecionado ? sessoesDoDia(diaSelecionado) : [];

  const filmeDe = (sessao) => filmes.find((filme) => filme.id === sessao.filme_id);

  return (
    <section
      id="agenda"
      className="scroll-mt-24 border-t-2 border-ink/15 bg-paper/50 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1360px] px-5 lg:px-10">
        <SectionHeading
          eyebrow="agenda"
          titulo="Programação por dia"
          descricao="Selecione uma data no calendário para ver as sessões confirmadas no gramado."
        />

        <div className="no-scrollbar mt-10 flex gap-2.5 overflow-x-auto pb-2">
          {dias.map((dia) => {
            const chave = format(dia, "yyyy-MM-dd");
            const ativo = chave === selecionado;
            const temSessao = sessoesDoDia(dia).length > 0;
            return (
              <button
                key={chave}
                type="button"
                onClick={() => setSelecionado(chave)}
                className={`flex min-w-[74px] shrink-0 flex-col items-center rounded-2xl border-2 px-3 py-3 text-center transition-all ${
                  ativo
                    ? "border-ink bg-coral text-ink shadow-block-sm"
                    : temSessao
                    ? "border-ink bg-card text-ink hover:bg-mustard/40"
                    : "border-ink/15 bg-cream/60 text-ink/40 hover:border-ink/40"
                }`}
              >
                <span className="text-[10px] uppercase tracking-retro">
                  {format(dia, "EEE", { locale: ptBR })}
                </span>
                <span className="mt-1 font-display text-xl font-bold">
                  {format(dia, "dd")}
                </span>
                <span className="text-[10px] uppercase">
                  {format(dia, "MMM", { locale: ptBR })}
                </span>
                {temSessao && (
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                      ativo ? "bg-ink" : "bg-coral"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {lista.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-card/50 px-6 py-12 text-center">
              <CalendarOff className="h-7 w-7 text-ink/35" />
              <p className="mt-3 font-display text-lg text-ink/70">
                Nenhuma sessão neste dia
              </p>
              <p className="mt-1 text-sm text-ink/50">
                As exibições costumam acontecer às sextas e sábados. Escolha uma
                data marcada acima.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {lista.map((sessao) => {
                const filme = filmeDe(sessao);
                return (
                  <article
                    key={sessao.id}
                    className="flex items-center gap-5 rounded-2xl border-2 border-ink bg-card p-4 shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block"
                  >
                    {filme?.poster_url && (
                      <Image
                        src={filme.poster_url}
                        alt={sessao.filme_titulo}
                        className="aspect-[2/3] w-20 shrink-0 rounded-lg border-2 border-ink"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm italic text-plum">
                        {filme?.genero || "Sessão especial"}
                      </p>
                      <h3 className="mt-0.5 truncate font-display text-xl font-semibold text-ink">
                        {sessao.filme_titulo}
                      </h3>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {sessao.horario}
                        </span>
                        {sessao.local && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {sessao.local}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/filme/${sessao.filme_id}`}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-mustard px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-coral"
                      >
                        Reservar setor
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ptBR } from "date-fns/locale";
import { addDays, format } from "date-fns";
import { ArrowRight, CalendarOff, Clock3, Loader2, LogIn, MapPin, Users } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import SectionHeading from "@/components/decor/SectionHeading";
import { chaveDia, formatarHora, vagasTotais } from "@/lib/evento";

function BotaoSessao({ sessao }) {
  const { user } = useAuth();
  const esgotada = vagasTotais(sessao.areas) === 0;
  const base =
    "mt-4 inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-1.5 text-xs font-semibold text-ink transition-colors";

  if (!user) {
    return (
      <Link to={`/login?returnTo=${encodeURIComponent(`/sessao/${sessao.id}`)}`} className={`${base} bg-cream hover:bg-mustard`}>
        <LogIn className="h-3.5 w-3.5" />
        Entrar para reservar
      </Link>
    );
  }
  const rotulo = user.role !== "CLIENTE" ? "Ver sessão" : esgotada ? "Esgotada" : "Reservar";
  return (
    <Link to={`/sessao/${sessao.id}`} className={`${base} bg-mustard hover:bg-coral`}>
      {rotulo}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function WeekSchedule({ sessoesIniciais = [], locais = [] }) {
  const [localId, setLocalId] = useState("");
  const [sessoes, setSessoes] = useState(sessoesIniciais);
  const [carregando, setCarregando] = useState(false);

  // filtro por local feito no servidor: GET /api/sessoes?localId=
  useEffect(() => {
    if (!localId) {
      setSessoes(sessoesIniciais);
      return;
    }
    let ativo = true;
    setCarregando(true);
    api.sessoes
      .listar({ localId })
      .then((lista) => ativo && setSessoes(lista))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [localId, sessoesIniciais]);

  const porDia = useMemo(() => {
    const mapa = new Map();
    sessoes.forEach((s) => {
      const chave = chaveDia(s.starts_at);
      mapa.set(chave, [...(mapa.get(chave) || []), s]);
    });
    return mapa;
  }, [sessoes]);

  const dias = useMemo(() => {
    const hoje = new Date();
    const ultima = sessoes.length ? new Date(sessoes[sessoes.length - 1].starts_at) : hoje;
    const total = Math.min(42, Math.max(14, Math.ceil((ultima - hoje) / 86400000) + 2));
    return Array.from({ length: total }, (_, i) => addDays(hoje, i));
  }, [sessoes]);

  const primeiroComSessao = dias.find((d) => porDia.has(chaveDia(d)));
  const [selecionado, setSelecionado] = useState(null);
  const diaAtivo = selecionado && dias.some((d) => chaveDia(d) === selecionado)
    ? selecionado
    : chaveDia(primeiroComSessao || dias[0]);
  const lista = porDia.get(diaAtivo) || [];

  return (
    <section id="agenda" className="scroll-mt-24 border-t-2 border-ink/15 bg-paper/50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-10">
        <SectionHeading
          eyebrow="agenda"
          titulo="Programação por dia"
          descricao="Filtre pelo local mais perto de você e escolha uma data marcada no calendário."
        />

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por local">
          {[{ id: "", name: "Todos os locais" }, ...locais].map((local) => {
            const ativo = String(local.id) === String(localId);
            return (
              <button
                key={local.id || "todos"}
                type="button"
                onClick={() => {
                  setLocalId(local.id ? String(local.id) : "");
                  setSelecionado(null);
                }}
                aria-pressed={ativo}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-4 py-2 text-xs font-semibold transition-colors ${
                  ativo ? "bg-ink text-cream" : "bg-card text-ink hover:bg-mustard/40"
                }`}
              >
                {local.id && <MapPin className="h-3.5 w-3.5" />}
                {local.name}
              </button>
            );
          })}
        </div>

        <div className="no-scrollbar mt-6 flex gap-2.5 overflow-x-auto pb-2">
          {dias.map((dia) => {
            const chave = chaveDia(dia);
            const ativo = chave === diaAtivo;
            const temSessao = porDia.has(chave);
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
                <span className="text-[10px] uppercase tracking-retro">{format(dia, "EEE", { locale: ptBR })}</span>
                <span className="mt-1 font-display text-xl font-bold">{format(dia, "dd")}</span>
                <span className="text-[10px] uppercase">{format(dia, "MMM", { locale: ptBR })}</span>
                {temSessao && <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${ativo ? "bg-ink" : "bg-coral"}`} />}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {carregando ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
            </div>
          ) : lista.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-card/50 px-6 py-12 text-center">
              <CalendarOff className="h-7 w-7 text-ink/35" />
              <p className="mt-3 font-display text-lg text-ink/70">Nenhuma sessão neste dia</p>
              <p className="mt-1 text-sm text-ink/50">
                {sessoes.length ? "Escolha uma data marcada acima." : "Não há sessões abertas para este local por enquanto."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {lista.map((sessao) => {
                const vagas = vagasTotais(sessao.areas);
                return (
                  <article
                    key={sessao.id}
                    className="flex items-center gap-5 rounded-2xl border-2 border-ink bg-card p-4 shadow-block-sm transition-all hover:-translate-y-0.5 hover:shadow-block"
                  >
                    <Image
                      src={sessao.banner_url}
                      alt={`Pôster de ${sessao.title}`}
                      className="aspect-[2/3] w-20 shrink-0 rounded-lg border-2 border-ink"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-sm italic text-plum">{sessao.genre || "Sessão especial"}</p>
                      <h3 className="mt-0.5 truncate font-display text-xl font-semibold text-ink">{sessao.title}</h3>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65">
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatarHora(sessao.starts_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {sessao.local}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {vagas > 0 ? `${vagas} vagas` : "Esgotada"}
                        </span>
                      </div>
                      <BotaoSessao sessao={sessao} />
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

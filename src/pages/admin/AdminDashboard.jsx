import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatarData } from "@/lib/evento";
import { Film, CalendarDays, Ticket, Armchair, Loader2 } from "lucide-react";

const hoje = () => new Date().toISOString().slice(0, 10);

function StatCard({ icon: Icon, label, valor, detalhe, cor }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-card p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink ${cor}`}>
        <Icon className="h-4 w-4 text-ink" />
      </span>
      <p className="mt-4 font-display text-3xl text-ink">{valor}</p>
      <p className="text-sm font-medium text-ink/70">{label}</p>
      {detalhe && <p className="mt-1 text-xs text-ink/45">{detalhe}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    (async () => {
      const [filmes, paginaSessoes, totalReservas, canceladas, soma, recentes] =
        await Promise.all([
          base44.entities.Filme.list(),
          base44.entities.Sessao.filter({ status: "ativa" }, { sort: "data", limit: 100 }),
          base44.entities.Reserva.count({ status: "confirmada" }),
          base44.entities.Reserva.count({ status: "cancelada" }),
          base44.entities.Reserva.aggregate({
            query: { status: "confirmada" },
            sum: ["quantidade"],
          }),
          base44.entities.Reserva.list({ sort: "-created_date", limit: 6 }),
        ]);
      const ingressos = (soma.rows || []).reduce(
        (t, r) => t + (Number(r.sum_quantidade) || 0),
        0
      );

      const proximas = (paginaSessoes.items || []).filter((s) => s.data >= hoje());
      const ids = proximas.map((s) => s.id);
      const setores = ids.length
        ? (await base44.entities.Setor.filter({ sessao_id: { $in: ids } }, { limit: 400 })).items || []
        : [];
      const vagas = setores.reduce(
        (total, setor) => total + (Number(setor.vagas_disponiveis) || 0),
        0
      );

      setDados({
        filmes: filmes.length,
        proximas,
        reservas: totalReservas,
        canceladas,
        ingressos,
        recentes: recentes.items || [],
        vagas,
      });
    })();
  }, []);

  if (!dados) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-retro text-ink/45">Visão geral</p>
      <h1 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Film}
          label="Filmes cadastrados"
          valor={dados.filmes}
          cor="bg-mustard/60"
        />
        <StatCard
          icon={CalendarDays}
          label="Próximas sessões"
          valor={dados.proximas.length}
          detalhe="Sessões ativas a partir de hoje"
          cor="bg-lagoon/40"
        />
        <StatCard
          icon={Ticket}
          label="Reservas confirmadas"
          valor={dados.reservas}
          detalhe={`${dados.ingressos} ingressos · ${dados.canceladas} canceladas`}
          cor="bg-coral/50"
        />
        <StatCard
          icon={Armchair}
          label="Vagas disponíveis"
          valor={dados.vagas}
          detalhe="Somando todos os setores"
          cor="bg-blush/40"
        />
      </div>

      <div className="mt-10 rounded-2xl border-2 border-ink bg-card">
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg text-ink">Próximas sessões</h2>
          <Link to="/admin/sessoes" className="text-sm font-medium text-coral hover:underline">
            Gerenciar
          </Link>
        </div>

        {dados.proximas.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/50">
            Nenhuma sessão agendada.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {dados.proximas.slice(0, 6).map((sessao) => (
              <li
                key={sessao.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{sessao.filme_titulo}</p>
                  <p className="text-xs text-ink/50">{sessao.local}</p>
                </div>
                <p className="text-sm text-ink/70">
                  {formatarData(sessao.data)} · {sessao.horario}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 rounded-2xl border-2 border-ink bg-card">
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg text-ink">Últimas reservas</h2>
          <Link to="/admin/reservas" className="text-sm font-medium text-coral hover:underline">
            Ver todas
          </Link>
        </div>
        {dados.recentes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/50">
            Nenhuma reserva ainda.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {dados.recentes.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {r.nome} · <span className="font-mono">{r.codigo}</span>
                  </p>
                  <p className="text-xs text-ink/50">
                    {r.filme_titulo} · {r.setor_nome} · {r.quantidade}{" "}
                    {r.quantidade === 1 ? "lugar" : "lugares"}
                  </p>
                </div>
                <span
                  className={`rounded-full border-2 border-ink px-3 py-0.5 text-[10px] font-semibold uppercase tracking-retro ${
                    r.status === "cancelada" ? "bg-blush/50" : "bg-lagoon/40"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
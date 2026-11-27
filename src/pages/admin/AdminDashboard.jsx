import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Film, MapPin, Ticket } from "lucide-react";
import { api } from "@/services/api";
import { formatarData, formatarHora } from "@/lib/evento";
import { Cabecalho, Carregando, Erro } from "@/components/admin/ui";

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
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.filmes.listar(), api.locais.listar(), api.sessoes.gestao()])
      .then(([filmes, locais, sessoes]) => {
        const agora = new Date().toISOString();
        const proximas = sessoes.filter((s) => s.status === "ABERTA" && s.starts_at > agora).reverse();
        const abertas = sessoes.filter((s) => s.status === "ABERTA");
        setDados({
          filmes: filmes.length,
          locais: locais.length,
          proximas,
          reservados: abertas.reduce((t, s) => t + s.validos + s.utilizados, 0),
          entradas: sessoes.reduce((t, s) => t + s.utilizados, 0),
          canceladas: sessoes.filter((s) => s.status === "CANCELADA").length,
        });
      })
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) return <Erro>{erro}</Erro>;
  if (!dados) return <Carregando />;

  return (
    <div>
      <Cabecalho sobre="visão geral" titulo="Painel da produção" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Próximas sessões" valor={dados.proximas.length} detalhe={`${dados.canceladas} canceladas no total`} cor="bg-lagoon/40" />
        <StatCard icon={Ticket} label="Ingressos reservados" valor={dados.reservados} detalhe={`${dados.entradas} entradas confirmadas na portaria`} cor="bg-coral/50" />
        <StatCard icon={Film} label="Filmes no catálogo" valor={dados.filmes} cor="bg-mustard/60" />
        <StatCard icon={MapPin} label="Locais cadastrados" valor={dados.locais} cor="bg-blush/40" />
      </div>

      <div className="mt-10 rounded-2xl border-2 border-ink bg-card">
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg text-ink">Próximas sessões</h2>
          <Link to="/admin/sessoes" className="text-sm font-medium text-coral hover:underline">
            Gerenciar sessões
          </Link>
        </div>
        {dados.proximas.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/50">Nenhuma sessão agendada.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {dados.proximas.slice(0, 8).map((s) => {
              const ocupacao = s.capacidade ? Math.round(((s.validos + s.utilizados) / s.capacidade) * 100) : 0;
              return (
                <li key={s.id}>
                  <Link to={`/admin/sessoes/${s.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-cream">
                    <div>
                      <p className="text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-xs text-ink/50">
                        {formatarData(s.starts_at)}, {formatarHora(s.starts_at)} · {s.local}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-28 overflow-hidden rounded-full border border-ink bg-cream">
                        <div className="h-full bg-coral" style={{ width: `${ocupacao}%` }} />
                      </div>
                      <span className="w-24 text-right text-xs text-ink/60">
                        {s.validos + s.utilizados}/{s.capacidade} lugares
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

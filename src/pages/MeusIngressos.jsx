import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TicketCard from "@/components/ingressos/TicketCard";

const hoje = () => new Date().toISOString().slice(0, 10);

const ABAS = [
  { id: "proximas", label: "Próximas sessões" },
  { id: "historico", label: "Histórico" },
  { id: "todas", label: "Todas" },
];

export default function MeusIngressos() {
  const [params] = useSearchParams();
  const novo = params.get("nova");
  const [reservas, setReservas] = useState(null);
  const [aba, setAba] = useState("proximas");

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const pagina = await base44.entities.Reserva.filter(
        { user_id: me.id },
        { sort: "sessao_data", limit: 100 }
      );
      setReservas(pagina.items || []);
    })();
  }, []);

  const ehProxima = (r) => r.status !== "cancelada" && r.sessao_data >= hoje();
  const lista = (reservas || []).filter((r) =>
    aba === "proximas" ? ehProxima(r) : aba === "historico" ? !ehProxima(r) : true
  );
  const contar = (id) =>
    (reservas || []).filter((r) => (id === "proximas" ? ehProxima(r) : !ehProxima(r))).length;

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10 lg:py-14">
        <p className="font-serif text-xl italic text-plum">área do visitante</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Meus ingressos
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink/65">
          Apresente o QR Code ou o código localizador na entrada do Parque Aurora.
        </p>

        {novo && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-ink bg-lagoon/30 px-5 py-4 text-sm text-ink">
            <Check className="h-5 w-5 shrink-0" />
            Reserva confirmada! Seu código é <strong className="font-mono">{novo}</strong>.
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {ABAS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAba(item.id)}
              className={`rounded-full border-2 border-ink px-4 py-2 text-xs font-semibold uppercase tracking-retro transition-colors ${
                aba === item.id ? "bg-ink text-cream" : "bg-card text-ink hover:bg-mustard/40"
              }`}
            >
              {item.label}
              {item.id !== "todas" && reservas ? ` · ${contar(item.id)}` : ""}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {!reservas ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
            </div>
          ) : lista.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-ink/25 p-10 text-center">
              <p className="font-display text-xl text-ink/70">Nenhum ingresso por aqui</p>
              <Link
                to="/#programacao"
                className="mt-5 inline-flex rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink"
              >
                Ver programação
              </Link>
            </div>
          ) : (
            lista.map((reserva) => (
              <TicketCard
                key={reserva.id}
                reserva={reserva}
                destaque={reserva.codigo === novo}
              />
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
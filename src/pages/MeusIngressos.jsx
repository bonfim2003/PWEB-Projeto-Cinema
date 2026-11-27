import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Check, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TicketCard from "@/components/ingressos/TicketCard";
import { toast } from "@/components/ui/use-toast";
import { formatarDataHora } from "@/lib/evento";

const ABAS = [
  { id: "proximas", label: "Próximas sessões" },
  { id: "historico", label: "Histórico" },
];

export default function MeusIngressos() {
  const [reservas, setReservas] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [aba, setAba] = useState("proximas");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [listaReservas, listaAvisos] = await Promise.all([api.reservas.minhas(), api.avisos.listar()]);
      setReservas(listaReservas);
      setAvisos(listaAvisos);
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cancelar = async (id) => {
    try {
      await api.reservas.cancelar(id);
      toast({ title: "Reserva cancelada", description: "As vagas já estão livres para outras pessoas." });
      await carregar();
    } catch (e) {
      toast({ title: "Não foi possível cancelar", description: e.message, variant: "destructive" });
    }
  };

  const marcarLido = async (id) => {
    await api.avisos.marcarLido(id);
    setAvisos((lista) => lista.map((a) => (a.id === id ? { ...a, is_read: 1 } : a)));
  };

  const agora = new Date().toISOString();
  const ehProxima = (r) => r.status === "ATIVA" && r.starts_at > agora;
  const lista = (reservas || []).filter((r) => (aba === "proximas" ? ehProxima(r) : !ehProxima(r)));
  const naoLidos = avisos.filter((a) => !a.is_read);

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10 lg:py-14">
        <p className="font-serif text-xl italic text-plum">sua conta</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">Meus ingressos</h1>
        <p className="mt-3 max-w-xl text-sm text-ink/65">
          Na entrada, mostre os códigos para a portaria. Cada código libera uma pessoa, uma única vez.
        </p>

        {naoLidos.length > 0 && (
          <section aria-label="Avisos" className="mt-8 space-y-3">
            {naoLidos.map((aviso) => (
              <div key={aviso.id} className="flex flex-wrap items-start gap-4 rounded-2xl border-2 border-ink bg-mustard/50 p-5 shadow-block-sm">
                <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{aviso.message}</p>
                  <p className="mt-1 text-xs text-ink/55">{formatarDataHora(aviso.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => marcarLido(aviso.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  <Check className="h-3.5 w-3.5" />
                  Entendi
                </button>
              </div>
            ))}
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {ABAS.map((item) => {
            const total = (reservas || []).filter((r) => (item.id === "proximas" ? ehProxima(r) : !ehProxima(r))).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAba(item.id)}
                aria-pressed={aba === item.id}
                className={`rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition-colors ${
                  aba === item.id ? "bg-ink text-cream" : "bg-card text-ink hover:bg-mustard/40"
                }`}
              >
                {item.label}
                {reservas ? ` (${total})` : ""}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-6">
          {erro ? (
            <p className="rounded-2xl border-2 border-coral bg-coral/20 p-5 text-sm text-ink">{erro}</p>
          ) : !reservas ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
            </div>
          ) : lista.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-ink/25 p-10 text-center">
              <p className="font-display text-xl text-ink/70">
                {aba === "proximas" ? "Você ainda não tem reservas para as próximas sessões" : "Nada no histórico ainda"}
              </p>
              <Link to="/#agenda" className="mt-5 inline-flex rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink">
                Ver a programação
              </Link>
            </div>
          ) : (
            lista.map((reserva) => <TicketCard key={reserva.id} reserva={reserva} onCancelar={cancelar} />)
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

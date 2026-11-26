import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { formatarData } from "@/lib/evento";
import { toast } from "@/components/ui/use-toast";
import { Search, Loader2, TicketX, Ban, Inbox } from "lucide-react";

const FILTROS = [
  { valor: "todas", label: "Todas" },
  { valor: "confirmada", label: "Confirmadas" },
  { valor: "cancelada", label: "Canceladas" },
];

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState("todas");
  const [cancelando, setCancelando] = useState("");

  const carregar = async (texto = termo, filtro = status) => {
    setCarregando(true);
    const lista = await api.reservas.list({
      status: filtro,
      busca: texto.trim(),
    });
    setReservas(lista || []);
    setCarregando(false);
  };

  useEffect(() => {
    carregar("", "todas");
  }, []);

  const buscar = (event) => {
    event.preventDefault();
    setTermo(busca);
    carregar(busca, status);
  };

  const trocarFiltro = (valor) => {
    setStatus(valor);
    carregar(termo, valor);
  };

  const limpar = () => {
    setBusca("");
    setTermo("");
    carregar("", status);
  };

  const cancelar = async (reserva) => {
    if (!window.confirm(`Cancelar a reserva ${reserva.codigo} e devolver as vagas?`)) return;
    setCancelando(reserva.id);
    try {
      await api.reservas.cancelar(reserva.id);
      setReservas((atuais) =>
        atuais.map((item) =>
          item.id === reserva.id ? { ...item, status: "cancelada" } : item
        )
      );
      toast({ title: "Reserva cancelada", description: "As vagas foram liberadas." });
    } catch (err) {
      toast({
        title: "Não foi possível cancelar",
        description: err?.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setCancelando("");
    }
  };

  return (
    <div>
      <p className="text-[10px] uppercase tracking-retro text-ink/45">Público</p>
      <h1 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Reservas</h1>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <form onSubmit={buscar} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por visitante, filme ou código"
              className="w-full rounded-full border-2 border-ink/25 bg-card py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border-2 border-ink bg-coral px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-2">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              onClick={() => trocarFiltro(filtro.valor)}
              className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-colors ${
                status === filtro.valor
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 text-ink/70 hover:border-ink"
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
          </div>
        ) : reservas.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Inbox className="h-7 w-7 text-ink/30" />
            <p className="mt-3 text-sm text-ink/50">Nenhuma reserva encontrada.</p>
            {termo && (
              <button
                type="button"
                onClick={limpar}
                className="mt-3 text-xs font-semibold text-coral hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b-2 border-ink/10 text-[10px] uppercase tracking-retro text-ink/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Código</th>
                  <th className="px-5 py-3 font-medium">Visitante</th>
                  <th className="px-5 py-3 font-medium">Filme / Sessão</th>
                  <th className="px-5 py-3 font-medium">Setor</th>
                  <th className="px-5 py-3 font-medium">Qtd.</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {reservas.map((reserva) => {
                  const cancelada = reserva.status === "cancelada";
                  return (
                    <tr key={reserva.id} className={cancelada ? "opacity-60" : ""}>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">
                        {reserva.codigo}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{reserva.nome}</p>
                        <p className="text-xs text-ink/50">{reserva.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-ink/80">{reserva.filme_titulo}</p>
                        <p className="text-xs text-ink/50">
                          {formatarData(reserva.sessao_data)} · {reserva.sessao_horario}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-ink/70">{reserva.setor_nome}</td>
                      <td className="px-5 py-3 text-ink/70">{reserva.quantidade}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-retro ${
                            cancelada
                              ? "border-ink/20 bg-ink/10 text-ink/60"
                              : "border-ink/30 bg-lagoon/30 text-ink"
                          }`}
                        >
                          {cancelada ? "Cancelada" : "Confirmada"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {cancelada ? (
                          <span className="inline-flex items-center gap-1 text-xs text-ink/40">
                            <TicketX className="h-3.5 w-3.5" />
                            —
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => cancelar(reserva)}
                            disabled={cancelando === reserva.id}
                            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/25 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-coral hover:bg-coral/20 disabled:opacity-50"
                          >
                            {cancelando === reserva.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Ban className="h-3 w-3" />
                            )}
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
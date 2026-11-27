import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import CodigoIngresso from "@/components/ingressos/CodigoIngresso";
import { Cabecalho, Carregando, Erro, Etiqueta } from "@/components/admin/ui";
import { formatarDataHora, formatarDataLonga, formatarHora } from "@/lib/evento";

export default function AdminSessaoReservas() {
  const { id } = useParams();
  const [sessao, setSessao] = useState(null);
  const [reservas, setReservas] = useState(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(() => {
    Promise.all([api.sessoes.detalhe(id), api.sessoes.reservas(id)])
      .then(([s, r]) => {
        setSessao(s);
        setReservas(r);
      })
      .catch((e) => setErro(e.message));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cancelarIngresso = async (ingresso) => {
    if (!window.confirm(`Cancelar o ingresso ${ingresso.code}? A vaga volta para a área.`)) return;
    try {
      await api.ingressos.cancelar(ingresso.id);
      toast({ title: "Ingresso cancelado" });
      carregar();
    } catch (e) {
      toast({ title: "Não foi possível cancelar", description: e.message, variant: "destructive" });
    }
  };

  if (erro) return <Erro>{erro}</Erro>;
  if (!sessao || !reservas) return <Carregando />;

  const ingressos = reservas.flatMap((r) => r.ingressos);
  const contar = (st) => ingressos.filter((t) => t.status === st).length;

  return (
    <div>
      <Link to="/admin/sessoes" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para sessões
      </Link>
      <div className="mt-4">
        <Cabecalho sobre={`${formatarDataLonga(sessao.starts_at)}, ${formatarHora(sessao.starts_at)} · ${sessao.local}`} titulo={sessao.title} />
      </div>
      {sessao.status === "CANCELADA" && (
        <p className="mt-4 rounded-xl border-2 border-ink bg-blush/30 px-4 py-3 text-sm text-ink">
          Sessão cancelada. Motivo: {sessao.cancel_reason}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sessao.areas.map((a) => (
          <div key={a.id} className="rounded-2xl border-2 border-ink bg-card p-4">
            <p className="text-sm font-semibold text-ink">{a.name}</p>
            <p className="mt-1 font-display text-2xl text-ink">
              {a.capacity - a.vagas}
              <span className="text-base text-ink/40"> / {a.capacity}</span>
            </p>
            <p className="text-xs text-ink/50">lugares ocupados</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-ink/70">
        {contar("VALIDO")} válidos · {contar("UTILIZADO")} já entraram · {contar("CANCELADO")} cancelados
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {reservas.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink/50">Nenhuma reserva nesta sessão.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {reservas.map((r) => (
              <li key={r.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{r.cliente}</p>
                    <Etiqueta valor={r.status}>{r.status === "ATIVA" ? "Ativa" : "Cancelada"}</Etiqueta>
                  </div>
                  <p className="text-xs text-ink/55">
                    {r.email} · {r.area} · reservado em {formatarDataHora(r.created_at)}
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {r.ingressos.map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <CodigoIngresso codigo={t.code} status={t.status} />
                      {t.status === "VALIDO" && (
                        <button
                          type="button"
                          onClick={() => cancelarIngresso(t)}
                          aria-label={`Cancelar ingresso ${t.code}`}
                          className="rounded-full border-2 border-ink/20 p-1 text-ink hover:border-coral hover:bg-coral/20"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

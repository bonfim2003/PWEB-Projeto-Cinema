import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, LogOut, ScanLine, Search, XCircle, LayoutDashboard } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/lib/AuthContext";
import Brand from "@/components/Brand";
import CodigoIngresso from "@/components/ingressos/CodigoIngresso";
import { formatarData, formatarHora } from "@/lib/evento";

/** Sessão sugerida: a aberta cujo horário está mais perto de agora. */
function maisProxima(sessoes) {
  const agora = Date.now();
  return [...sessoes].sort(
    (a, b) => Math.abs(new Date(a.starts_at) - agora) - Math.abs(new Date(b.starts_at) - agora)
  )[0];
}

export default function Portaria() {
  const { user, sair } = useAuth();
  const [sessoes, setSessoes] = useState(null);
  const [sessaoId, setSessaoId] = useState("");
  const [reservas, setReservas] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [validando, setValidando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [busca, setBusca] = useState("");
  const campo = useRef(null);

  useEffect(() => {
    api.sessoes.gestao().then((lista) => {
      const abertas = lista.filter((s) => s.status === "ABERTA");
      setSessoes(abertas);
      const sugestao = maisProxima(abertas);
      if (sugestao) setSessaoId(String(sugestao.id));
    });
  }, []);

  const carregarReservas = useCallback(async () => {
    if (!sessaoId) return;
    setReservas(await api.sessoes.reservas(sessaoId));
  }, [sessaoId]);

  useEffect(() => {
    setResultado(null);
    setHistorico([]);
    carregarReservas();
  }, [carregarReservas]);

  const ingressos = useMemo(() => reservas.filter((r) => r.status === "ATIVA").flatMap((r) => r.ingressos), [reservas]);
  const presentes = ingressos.filter((t) => t.status === "UTILIZADO").length;
  const esperados = ingressos.filter((t) => t.status !== "CANCELADO").length;

  const validar = async (event) => {
    event.preventDefault();
    if (!sessaoId || !codigo.trim()) return;
    setValidando(true);
    try {
      const r = await api.ingressos.validar(Number(sessaoId), codigo);
      setResultado({ ok: true, ...r });
      setHistorico((h) => [{ ok: true, codigo: r.codigo, texto: `${r.nome} · ${r.area}` }, ...h].slice(0, 8));
      await carregarReservas();
    } catch (e) {
      setResultado({ ok: false, mensagem: e.message, codigo: codigo.toUpperCase() });
      setHistorico((h) => [{ ok: false, codigo: codigo.toUpperCase(), texto: e.message }, ...h].slice(0, 8));
    } finally {
      setCodigo("");
      setValidando(false);
      campo.current?.focus();
    }
  };

  const sessaoAtual = sessoes?.find((s) => String(s.id) === sessaoId);
  const filtradas = reservas.filter((r) =>
    `${r.cliente} ${r.area} ${r.ingressos.map((t) => t.code).join(" ")}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="paper-grain min-h-screen bg-cream">
      <header className="border-b-2 border-ink bg-ink">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <Brand tone="light" compact />
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-cream/60 sm:block">{user?.name}</span>
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border-2 border-cream/60 px-4 py-2 text-sm font-semibold text-cream hover:bg-cream hover:text-ink">
                <LayoutDashboard className="h-4 w-4" />
                Painel
              </Link>
            )}
            <button type="button" onClick={sair} className="inline-flex items-center gap-2 rounded-full border-2 border-cream/60 px-4 py-2 text-sm font-semibold text-cream hover:bg-cream hover:text-ink">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10 lg:py-12">
        <p className="font-serif text-xl italic text-plum">portaria</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">Validar entrada</h1>

        {!sessoes ? (
          <Loader2 className="mt-10 h-6 w-6 animate-spin text-ink/40" />
        ) : sessoes.length === 0 ? (
          <p className="mt-8 rounded-2xl border-2 border-dashed border-ink/25 p-8 text-center text-ink/60">
            Nenhuma sessão aberta no momento.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-ink bg-card p-5 sm:p-7">
                <label htmlFor="sessao" className="text-sm font-semibold text-ink">
                  Sessão
                </label>
                <select
                  id="sessao"
                  value={sessaoId}
                  onChange={(e) => setSessaoId(e.target.value)}
                  className="mt-2 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-3 text-sm text-ink outline-none focus:border-ink"
                >
                  {sessoes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatarData(s.starts_at)} {formatarHora(s.starts_at)} · {s.title} · {s.local}
                    </option>
                  ))}
                </select>

                <form onSubmit={validar} className="mt-6">
                  <label htmlFor="codigo" className="text-sm font-semibold text-ink">
                    Código do ingresso
                  </label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="codigo"
                      ref={campo}
                      autoFocus
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      maxLength={10}
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder="ABCD2345"
                      className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-cream px-4 py-3 text-center font-display text-3xl font-bold tracking-[0.3em] text-ink outline-none placeholder:text-ink/20 focus:shadow-block-sm"
                    />
                    <button
                      type="submit"
                      disabled={validando || codigo.length < 8}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {validando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                      Validar entrada
                    </button>
                  </div>
                </form>
              </div>

              {resultado && (
                <div
                  role="status"
                  aria-live="assertive"
                  className={`rounded-2xl border-2 border-ink p-6 shadow-block ${resultado.ok ? "bg-lagoon/60" : "bg-coral/60"}`}
                >
                  <div className="flex items-start gap-4">
                    {resultado.ok ? (
                      <CheckCircle2 className="h-10 w-10 shrink-0 text-ink" />
                    ) : (
                      <XCircle className="h-10 w-10 shrink-0 text-ink" />
                    )}
                    <div>
                      <p className="font-display text-3xl font-semibold text-ink">
                        {resultado.ok ? "Entrada liberada" : "Entrada recusada"}
                      </p>
                      {resultado.ok ? (
                        <p className="mt-2 text-lg text-ink">
                          {resultado.nome} · <strong>{resultado.area}</strong>
                        </p>
                      ) : (
                        <p className="mt-2 text-lg text-ink">{resultado.mensagem}</p>
                      )}
                      <p className="mt-1 font-display text-sm tracking-[0.2em] text-ink/60">{resultado.codigo}</p>
                    </div>
                  </div>
                </div>
              )}

              {historico.length > 0 && (
                <div className="rounded-2xl border-2 border-ink/20 bg-card p-5">
                  <p className="text-sm font-semibold text-ink">Últimas leituras</p>
                  <ul className="mt-3 divide-y divide-ink/10 text-sm">
                    {historico.map((h, i) => (
                      <li key={i} className="flex items-center gap-3 py-2">
                        {h.ok ? <CheckCircle2 className="h-4 w-4 text-lagoon" /> : <XCircle className="h-4 w-4 text-coral" />}
                        <span className="font-display tracking-[0.15em] text-ink">{h.codigo}</span>
                        <span className="truncate text-ink/60">{h.texto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border-2 border-ink bg-card">
              <div className="border-b-2 border-ink/10 p-5">
                <p className="font-display text-lg text-ink">{sessaoAtual?.title}</p>
                <p className="text-sm text-ink/55">{sessaoAtual?.local}</p>
                <p className="mt-4 font-display text-4xl font-semibold text-ink">
                  {presentes}
                  <span className="text-xl text-ink/40"> / {esperados}</span>
                </p>
                <p className="text-sm text-ink/60">pessoas já entraram</p>
                <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-cream">
                  <div className="h-full bg-mustard transition-all" style={{ width: `${esperados ? (presentes / esperados) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome ou código"
                    aria-label="Buscar reserva"
                    className="w-full rounded-xl border-2 border-ink/25 bg-cream py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
                  />
                </div>
                <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {filtradas.length === 0 && <li className="py-6 text-center text-sm text-ink/50">Nenhuma reserva.</li>}
                  {filtradas.map((r) => (
                    <li key={r.id} className={`rounded-xl border-2 border-ink/15 p-3 ${r.status === "CANCELADA" ? "opacity-50" : ""}`}>
                      <p className="text-sm font-semibold text-ink">{r.cliente}</p>
                      <p className="text-xs text-ink/55">{r.area}</p>
                      <div className="mt-2 space-y-1.5">
                        {r.ingressos.map((t) => (
                          <CodigoIngresso key={t.id} codigo={t.code} status={t.status} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

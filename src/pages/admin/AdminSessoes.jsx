import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, CalendarOff, Loader2, Plus, Users } from "lucide-react";
import { api } from "@/services/api";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { BotaoPrincipal, Cabecalho, Carregando, Erro, Etiqueta, campo } from "@/components/admin/ui";
import { formatarData, formatarHora } from "@/lib/evento";

const situacao = (s) => (s.status === "CANCELADA" ? "CANCELADA" : new Date(s.starts_at) <= new Date() ? "ENCERRADA" : "ABERTA");
const ROTULO = { ABERTA: "Aberta", ENCERRADA: "Já começou", CANCELADA: "Cancelada" };

export default function AdminSessoes() {
  const [sessoes, setSessoes] = useState(null);
  const [filmes, setFilmes] = useState([]);
  const [locais, setLocais] = useState([]);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ movieId: "", locationId: "", inicio: "" });
  const [cancelando, setCancelando] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = () => api.sessoes.gestao().then(setSessoes);
  useEffect(() => {
    carregar();
    api.filmes.listar().then(setFilmes);
    api.locais.listar().then(setLocais);
  }, []);

  const abrirNova = () => {
    setForm({ movieId: filmes[0]?.id || "", locationId: locais[0]?.id || "", inicio: "" });
    setErroForm("");
    setCriando(true);
  };

  const criar = async (event) => {
    event.preventDefault();
    setErroForm("");
    setEnviando(true);
    try {
      // datetime-local vem no horário do navegador; toISOString converte para UTC
      await api.sessoes.criar({
        movieId: Number(form.movieId),
        locationId: Number(form.locationId),
        startsAt: new Date(form.inicio).toISOString(),
      });
      toast({ title: "Sessão criada", description: "As áreas do local foram copiadas para a sessão." });
      setCriando(false);
      await carregar();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const confirmarCancelamento = async (event) => {
    event.preventDefault();
    setErroForm("");
    setEnviando(true);
    try {
      const { notificados } = await api.sessoes.cancelar(cancelando.id, motivo);
      toast({
        title: "Sessão cancelada",
        description: notificados ? `${notificados} pessoa(s) receberam o aviso em Meus ingressos.` : "Não havia reservas ativas.",
      });
      setCancelando(null);
      await carregar();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const localEscolhido = locais.find((l) => String(l.id) === String(form.locationId));

  return (
    <div>
      <Cabecalho
        sobre="agenda"
        titulo="Sessões"
        acao={
          <BotaoPrincipal onClick={abrirNova} disabled={!filmes.length || !locais.length}>
            <Plus className="h-4 w-4" />
            Nova sessão
          </BotaoPrincipal>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {!sessoes ? (
          <Carregando />
        ) : sessoes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarOff className="h-7 w-7 text-ink/30" />
            <p className="mt-3 text-sm text-ink/50">Nenhuma sessão cadastrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {sessoes.map((s) => {
              const sit = situacao(s);
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Image src={s.banner_url} alt="" className="h-14 w-10 shrink-0 rounded border border-ink/20" />
                  <div className="min-w-[200px] flex-1">
                    <p className="font-semibold text-ink">{s.title}</p>
                    <p className="text-xs text-ink/55">
                      {formatarData(s.starts_at)}, {formatarHora(s.starts_at)} · {s.local}
                    </p>
                    {s.status === "CANCELADA" && <p className="mt-1 text-xs text-ink/55">Motivo: {s.cancel_reason}</p>}
                  </div>
                  <Etiqueta valor={sit}>{ROTULO[sit]}</Etiqueta>
                  <span className="w-28 text-right text-xs text-ink/60">
                    {s.validos + s.utilizados}/{s.capacidade} reservados
                    <br />
                    {s.utilizados} entraram
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/sessoes/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-xs font-semibold text-ink hover:bg-mustard/40"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Reservas
                    </Link>
                    {sit === "ABERTA" && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelando(s);
                          setMotivo("");
                          setErroForm("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/30 px-3 py-1.5 text-xs font-semibold text-ink hover:border-coral hover:bg-coral/20"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent className="max-w-lg rounded-2xl border-2 border-ink bg-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">Nova sessão</DialogTitle>
          </DialogHeader>
          <form onSubmit={criar} className="space-y-4">
            <div>
              <label htmlFor="filme" className="text-sm font-semibold text-ink">Filme</label>
              <select id="filme" required value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} className={campo}>
                {filmes.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="local" className="text-sm font-semibold text-ink">Local</label>
              <select id="local" required value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} className={campo}>
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              {localEscolhido && (
                <p className="mt-1 text-xs text-ink/50">
                  Áreas copiadas: {localEscolhido.areas.map((a) => `${a.name} (${a.capacity})`).join(", ")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="inicio" className="text-sm font-semibold text-ink">Data e hora</label>
              <input id="inicio" type="datetime-local" required value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} className={campo} />
            </div>
            <Erro>{erroForm}</Erro>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCriando(false)} className="rounded-full border-2 border-ink/25 px-5 py-2.5 text-sm font-semibold text-ink">
                Voltar
              </button>
              <button type="submit" disabled={enviando} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60">
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar sessão
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(cancelando)} onOpenChange={(v) => !v && setCancelando(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-2 border-ink bg-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">Cancelar sessão</DialogTitle>
          </DialogHeader>
          {cancelando && (
            <form onSubmit={confirmarCancelamento} className="space-y-4">
              <p className="text-sm text-ink/70">
                <strong>{cancelando.title}</strong>, {formatarData(cancelando.starts_at)} às {formatarHora(cancelando.starts_at)} em{" "}
                {cancelando.local}. Todas as reservas e ingressos serão cancelados e cada pessoa recebe um aviso com o motivo.
                Para remarcar, crie uma nova sessão.
              </p>
              <div>
                <label htmlFor="motivo" className="text-sm font-semibold text-ink">Motivo</label>
                <textarea id="motivo" required minLength={3} rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: previsão de chuva forte" className={campo} />
              </div>
              <Erro>{erroForm}</Erro>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCancelando(null)} className="rounded-full border-2 border-ink/25 px-5 py-2.5 text-sm font-semibold text-ink">
                  Voltar
                </button>
                <button type="submit" disabled={enviando} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60">
                  {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancelar sessão e avisar
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

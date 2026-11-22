import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatarData } from "@/lib/evento";
import { SETORES_PADRAO, CAPACIDADES_PADRAO } from "@/lib/setores";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2, CalendarOff } from "lucide-react";

const campo =
  "mt-1 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

const FORM_VAZIO = {
  filme_id: "",
  data: "",
  horario: "19h30",
  local: "Parque Aurora — Gramado principal",
  status: "ativa",
};

export default function AdminSessoes() {
  const [sessoes, setSessoes] = useState([]);
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [capacidades, setCapacidades] = useState(CAPACIDADES_PADRAO);
  const [setoresOriginais, setSetoresOriginais] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    const [listaSessoes, listaFilmes] = await Promise.all([
      base44.entities.Sessao.filter({}, { sort: "data", limit: 200 }),
      base44.entities.Filme.list("-created_date", 200),
    ]);
    setSessoes(listaSessoes.items || []);
    setFilmes(listaFilmes);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirNova = () => {
    setEditando(null);
    setForm({ ...FORM_VAZIO, filme_id: filmes[0]?.id || "" });
    setCapacidades(CAPACIDADES_PADRAO);
    setSetoresOriginais([]);
    setAberto(true);
  };

  const abrirEdicao = async (sessao) => {
    setEditando(sessao);
    setForm({
      filme_id: sessao.filme_id || "",
      data: sessao.data || "",
      horario: sessao.horario || "",
      local: sessao.local || "",
      status: sessao.status || "ativa",
    });
    const pagina = await base44.entities.Setor.filter(
      { sessao_id: sessao.id },
      { sort: "ordem", limit: 10 }
    );
    const setores = pagina.items || [];
    setSetoresOriginais(setores);
    const novas = { ...CAPACIDADES_PADRAO };
    SETORES_PADRAO.forEach((def) => {
      const encontrado = setores.find((setor) => setor.tipo === def.tipo);
      if (encontrado) novas[def.chave] = encontrado.capacidade_total;
    });
    setCapacidades(novas);
    setAberto(true);
  };

  const salvar = async (event) => {
    event.preventDefault();
    setSalvando(true);
    const filme = filmes.find((item) => item.id === form.filme_id);
    const payload = { ...form, filme_titulo: filme?.titulo || "" };

    try {
      if (editando) {
        await base44.entities.Sessao.update(editando.id, payload);

        const atualizacoes = [];
        const criacoes = [];
        SETORES_PADRAO.forEach((def) => {
          const original = setoresOriginais.find((setor) => setor.tipo === def.tipo);
          const novaCapacidade = Number(capacidades[def.chave]) || 0;
          if (original) {
            const ocupadas = Math.max(
              0,
              (Number(original.capacidade_total) || 0) -
                (Number(original.vagas_disponiveis) || 0)
            );
            atualizacoes.push({
              id: original.id,
              capacidade_total: novaCapacidade,
              vagas_disponiveis: Math.max(0, novaCapacidade - ocupadas),
            });
          } else {
            criacoes.push({
              sessao_id: editando.id,
              nome: def.nome,
              tipo: def.tipo,
              descricao: def.descricao,
              capacidade_total: novaCapacidade,
              vagas_disponiveis: novaCapacidade,
              ordem: def.ordem,
            });
          }
        });
        if (atualizacoes.length) await base44.entities.Setor.bulkUpdate(atualizacoes);
        if (criacoes.length) await base44.entities.Setor.bulkCreate(criacoes);
      } else {
        const nova = await base44.entities.Sessao.create(payload);
        await base44.entities.Setor.bulkCreate(
          SETORES_PADRAO.map((def) => ({
            sessao_id: nova.id,
            nome: def.nome,
            tipo: def.tipo,
            descricao: def.descricao,
            capacidade_total: Number(capacidades[def.chave]) || 0,
            vagas_disponiveis: Number(capacidades[def.chave]) || 0,
            ordem: def.ordem,
          }))
        );
      }
      toast({ title: editando ? "Sessão atualizada" : "Sessão criada" });
      setAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (sessao) => {
    if (!window.confirm(`Excluir a sessão de "${sessao.filme_titulo}"?`)) return;
    await base44.entities.Setor.deleteMany({ sessao_id: sessao.id });
    await base44.entities.Sessao.delete(sessao.id);
    toast({ title: "Sessão excluída" });
    await carregar();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-retro text-ink/45">Agenda</p>
          <h1 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Sessões</h1>
        </div>
        <button
          type="button"
          onClick={abrirNova}
          disabled={filmes.length === 0}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-5 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova sessão
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
          </div>
        ) : sessoes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarOff className="h-7 w-7 text-ink/30" />
            <p className="mt-3 text-sm text-ink/50">Nenhuma sessão agendada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b-2 border-ink/10 text-[10px] uppercase tracking-retro text-ink/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Filme</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Horário</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {sessoes.map((sessao) => (
                  <tr key={sessao.id}>
                    <td className="px-5 py-3 font-semibold text-ink">
                      {sessao.filme_titulo}
                    </td>
                    <td className="px-5 py-3 text-ink/70">{formatarData(sessao.data)}</td>
                    <td className="px-5 py-3 text-ink/70">{sessao.horario}</td>
                    <td className="px-5 py-3 text-ink/60">{sessao.local}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-retro ${
                          sessao.status === "cancelada"
                            ? "border-coral bg-coral/25 text-ink"
                            : "border-ink/30 bg-lagoon/30 text-ink"
                        }`}
                      >
                        {sessao.status === "cancelada" ? "Cancelada" : "Ativa"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(sessao)}
                          aria-label="Editar sessão"
                          className="rounded-lg border-2 border-ink/20 p-2 text-ink transition-colors hover:border-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(sessao)}
                          aria-label="Excluir sessão"
                          className="rounded-lg border-2 border-ink/20 p-2 text-ink transition-colors hover:border-coral hover:bg-coral/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-2 border-ink bg-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">
              {editando ? "Editar sessão" : "Nova sessão"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={salvar} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-ink">Filme</label>
              <Select
                value={form.filme_id}
                onValueChange={(valor) => setForm({ ...form, filme_id: valor })}
              >
                <SelectTrigger className="mt-1 h-[42px] rounded-xl border-2 border-ink/25 bg-cream">
                  <SelectValue placeholder="Selecione o filme" />
                </SelectTrigger>
                <SelectContent>
                  {filmes.map((filme) => (
                    <SelectItem key={filme.id} value={filme.id}>
                      {filme.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="data">
                  Data
                </label>
                <input
                  id="data"
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="horario">
                  Horário
                </label>
                <input
                  id="horario"
                  required
                  placeholder="19h30"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  className={campo}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="local">
                  Local
                </label>
                <input
                  id="local"
                  value={form.local}
                  onChange={(e) => setForm({ ...form, local: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(valor) => setForm({ ...form, status: valor })}
                >
                  <SelectTrigger className="mt-1 h-[42px] rounded-xl border-2 border-ink/25 bg-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-ink/15 p-4">
              <p className="text-sm font-semibold text-ink">Capacidade por setor</p>
              <p className="mt-1 text-xs text-ink/50">
                As vagas já reservadas são preservadas ao alterar a capacidade.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SETORES_PADRAO.map((def) => (
                  <div key={def.chave}>
                    <label className="text-xs font-medium text-ink/70" htmlFor={`cap-${def.chave}`}>
                      {def.nome} · {def.tipo}
                    </label>
                    <input
                      id={`cap-${def.chave}`}
                      type="number"
                      min="0"
                      value={capacidades[def.chave]}
                      onChange={(e) =>
                        setCapacidades({ ...capacidades, [def.chave]: e.target.value })
                      }
                      className={campo}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-full border-2 border-ink/25 px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
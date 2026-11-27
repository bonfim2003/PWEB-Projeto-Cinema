import { useEffect, useState } from "react";
import { Loader2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { BotaoPrincipal, Cabecalho, Carregando, Erro, campo } from "@/components/admin/ui";

const AREA_VAZIA = { name: "", description: "", capacity: "" };

export default function AdminLocais() {
  const [locais, setLocais] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", areas: [AREA_VAZIA] });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = () => api.locais.listar().then(setLocais);
  useEffect(() => {
    carregar();
  }, []);

  const abrir = (local = null) => {
    setEditando(local);
    setForm(
      local
        ? {
            name: local.name,
            address: local.address || "",
            areas: local.areas.map((a) => ({ name: a.name, description: a.description || "", capacity: a.capacity })),
          }
        : { name: "", address: "", areas: [{ ...AREA_VAZIA }] }
    );
    setErroForm("");
    setAberto(true);
  };

  const mudarArea = (i, chave, valor) =>
    setForm({ ...form, areas: form.areas.map((a, j) => (j === i ? { ...a, [chave]: valor } : a)) });

  const salvar = async (event) => {
    event.preventDefault();
    setErroForm("");
    setSalvando(true);
    try {
      const dados = { ...form, areas: form.areas.map((a) => ({ ...a, capacity: Number(a.capacity) })) };
      if (editando) await api.locais.atualizar(editando.id, dados);
      else await api.locais.criar(dados);
      toast({ title: editando ? "Local atualizado" : "Local cadastrado" });
      setAberto(false);
      await carregar();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (local) => {
    if (!window.confirm(`Excluir "${local.name}"?`)) return;
    try {
      await api.locais.excluir(local.id);
      toast({ title: "Local excluído" });
      await carregar();
    } catch (e) {
      toast({ title: "Não foi possível excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Cabecalho
        sobre="onde o telão para"
        titulo="Locais e áreas"
        acao={
          <BotaoPrincipal onClick={() => abrir()}>
            <Plus className="h-4 w-4" />
            Novo local
          </BotaoPrincipal>
        }
      />
      <p className="mt-3 max-w-2xl text-sm text-ink/60">
        As áreas e capacidades são copiadas para a sessão no momento em que ela é criada. Editar um local não muda
        sessões que já existem.
      </p>

      {!locais ? (
        <Carregando />
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {locais.map((local) => (
            <article key={local.id} className="flex flex-col rounded-2xl border-2 border-ink bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                    <MapPin className="h-4 w-4 text-coral" />
                    {local.name}
                  </h2>
                  <p className="mt-1 text-sm text-ink/55">{local.address || "Sem endereço"}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => abrir(local)} aria-label={`Editar ${local.name}`} className="rounded-lg border-2 border-ink/20 p-2 text-ink hover:border-ink">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => excluir(local)} aria-label={`Excluir ${local.name}`} className="rounded-lg border-2 border-ink/20 p-2 text-ink hover:border-coral hover:bg-coral/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-ink/10 border-t-2 border-ink/10 text-sm">
                {local.areas.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3 py-2">
                    <span className="text-ink">{a.name}</span>
                    <span className="text-ink/60">{a.capacity} lugares</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-3 text-xs font-semibold text-ink/60">
                Total: {local.areas.reduce((t, a) => t + a.capacity, 0)} lugares
              </p>
            </article>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-2 border-ink bg-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{editando ? "Editar local" : "Novo local"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nome-local" className="text-sm font-semibold text-ink">Nome</label>
                <input id="nome-local" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={campo} />
              </div>
              <div>
                <label htmlFor="endereco" className="text-sm font-semibold text-ink">Endereço</label>
                <input id="endereco" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={campo} />
              </div>
            </div>

            <fieldset className="rounded-2xl border-2 border-ink/15 p-4">
              <legend className="px-1 text-sm font-semibold text-ink">Áreas</legend>
              <p className="text-xs text-ink/50">A primeira área da lista aparece mais perto da tela no mapa.</p>
              <div className="mt-3 space-y-3">
                {form.areas.map((area, i) => (
                  <div key={i} className="grid gap-2 rounded-xl border-2 border-ink/10 bg-card p-3 sm:grid-cols-[1fr_110px_auto]">
                    <input aria-label={`Nome da área ${i + 1}`} required placeholder="Nome (ex.: Pufes)" value={area.name} onChange={(e) => mudarArea(i, "name", e.target.value)} className={campo} />
                    <input aria-label={`Capacidade da área ${i + 1}`} required type="number" min="1" max="5000" placeholder="Lugares" value={area.capacity} onChange={(e) => mudarArea(i, "capacity", e.target.value)} className={campo} />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, areas: form.areas.filter((_, j) => j !== i) })}
                      disabled={form.areas.length === 1}
                      aria-label={`Remover área ${i + 1}`}
                      className="mt-1 flex items-center justify-center rounded-xl border-2 border-ink/20 px-3 text-ink hover:border-coral disabled:opacity-30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <input aria-label={`Descrição da área ${i + 1}`} placeholder="Descrição curta (opcional)" value={area.description} onChange={(e) => mudarArea(i, "description", e.target.value)} className={`${campo} sm:col-span-3`} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, areas: [...form.areas, { ...AREA_VAZIA }] })}
                className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-xs font-semibold text-ink hover:bg-mustard/40"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar área
              </button>
            </fieldset>

            <Erro>{erroForm}</Erro>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAberto(false)} className="rounded-full border-2 border-ink/25 px-5 py-2.5 text-sm font-semibold text-ink">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60">
                {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                {editando ? "Salvar alterações" : "Cadastrar local"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

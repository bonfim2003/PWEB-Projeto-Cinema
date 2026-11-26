import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2, SearchX, AlertCircle } from "lucide-react";
import PosterUpload from "@/components/admin/PosterUpload";
import TrailerField from "@/components/admin/TrailerField";
import { parseYoutube, youtubeWatchUrl } from "@/lib/youtube";

const VAZIO = {
  titulo: "",
  genero: "",
  sinopse: "",
  duracao: "",
  ano: "",
  diretor: "",
  classificacao: "Livre",
  poster_url: "",
  trailer_url: "",
};

const CLASSIFICACOES = ["Livre", "10 anos", "12 anos", "14 anos", "16 anos", "18 anos"];

const campo =
  "mt-1 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

export default function AdminFilmes() {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = async () => {
    setCarregando(true);
    const lista = await api.filmes.list();
    setFilmes(lista);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm(VAZIO);
    setErroForm("");
    setAberto(true);
  };

  const abrirEdicao = (filme) => {
    setEditando(filme);
    setForm({
      titulo: filme.titulo || "",
      genero: filme.genero || "",
      sinopse: filme.sinopse || "",
      duracao: filme.duracao || "",
      ano: filme.ano || "",
      diretor: filme.diretor || "",
      classificacao: filme.classificacao || "Livre",
      poster_url: filme.poster_url || "",
      trailer_url: filme.trailer_url || "",
    });
    setErroForm("");
    setAberto(true);
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErroForm("");

    const { id: trailerId, erro: trailerErro } = parseYoutube(form.trailer_url);
    if (trailerErro) {
      setErroForm(trailerErro);
      return;
    }

    setSalvando(true);
    const dados = {
      ...form,
      trailer_url: trailerId ? youtubeWatchUrl(trailerId) : "",
      duracao: Number(form.duracao) || 0,
      ano: Number(form.ano) || 0,
    };
    try {
      if (editando) {
        await api.filmes.update(editando.id, dados);
      } else {
        await api.filmes.create(dados);
      }
      toast({ title: editando ? "Filme atualizado" : "Filme cadastrado" });
      setAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (filme) => {
    if (!window.confirm(`Excluir o filme "${filme.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    await api.filmes.delete(filme.id);
    toast({ title: "Filme excluído" });
    await carregar();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-retro text-ink/45">Catálogo</p>
          <h1 className="mt-2 font-display text-3xl text-ink lg:text-4xl">Filmes</h1>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-5 py-3 text-sm font-semibold text-ink shadow-block-sm transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Novo filme
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
          </div>
        ) : filmes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <SearchX className="h-7 w-7 text-ink/30" />
            <p className="mt-3 text-sm text-ink/50">Nenhum filme cadastrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b-2 border-ink/10 text-[10px] uppercase tracking-retro text-ink/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Filme</th>
                  <th className="px-5 py-3 font-medium">Gênero</th>
                  <th className="px-5 py-3 font-medium">Ano</th>
                  <th className="px-5 py-3 font-medium">Duração</th>
                  <th className="px-5 py-3 font-medium">Classificação</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {filmes.map((filme) => (
                  <tr key={filme.id} className="align-middle">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {filme.poster_url ? (
                          <Image
                            src={filme.poster_url}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded border border-ink/20"
                          />
                        ) : (
                          <span className="h-14 w-10 shrink-0 rounded bg-ink/10" />
                        )}
                        <span className="font-semibold text-ink">{filme.titulo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{filme.genero || "—"}</td>
                    <td className="px-5 py-3 text-ink/70">{filme.ano || "—"}</td>
                    <td className="px-5 py-3 text-ink/70">
                      {filme.duracao ? `${filme.duracao} min` : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink/70">{filme.classificacao || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEdicao(filme)}
                          aria-label={`Editar ${filme.titulo}`}
                          className="rounded-lg border-2 border-ink/20 p-2 text-ink transition-colors hover:border-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(filme)}
                          aria-label={`Excluir ${filme.titulo}`}
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
              {editando ? "Editar filme" : "Novo filme"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="titulo">
                  Título
                </label>
                <input
                  id="titulo"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="genero">
                  Gênero
                </label>
                <input
                  id="genero"
                  value={form.genero}
                  onChange={(e) => setForm({ ...form, genero: e.target.value })}
                  placeholder="Drama, Musical..."
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="diretor">
                  Direção
                </label>
                <input
                  id="diretor"
                  value={form.diretor}
                  onChange={(e) => setForm({ ...form, diretor: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="ano">
                  Ano
                </label>
                <input
                  id="ano"
                  type="number"
                  value={form.ano}
                  onChange={(e) => setForm({ ...form, ano: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="duracao">
                  Duração (min)
                </label>
                <input
                  id="duracao"
                  type="number"
                  value={form.duracao}
                  onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                  className={campo}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Classificação</label>
                <Select
                  value={form.classificacao}
                  onValueChange={(valor) => setForm({ ...form, classificacao: valor })}
                >
                  <SelectTrigger className="mt-1 h-[42px] rounded-xl border-2 border-ink/25 bg-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFICACOES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="sinopse">
                  Sinopse
                </label>
                <textarea
                  id="sinopse"
                  rows={4}
                  value={form.sinopse}
                  onChange={(e) => setForm({ ...form, sinopse: e.target.value })}
                  className={campo}
                />
              </div>
              <div className="sm:col-span-2 rounded-2xl border-2 border-ink/15 p-4">
                <PosterUpload
                  value={form.poster_url}
                  onChange={(url) => setForm({ ...form, poster_url: url })}
                />
              </div>
              <div className="sm:col-span-2">
                <TrailerField
                  value={form.trailer_url}
                  onChange={(valor) => setForm({ ...form, trailer_url: valor })}
                />
              </div>
            </div>

            {erroForm && (
              <p className="flex items-start gap-2 rounded-xl border-2 border-coral bg-coral/20 px-3 py-2 text-sm text-ink">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {erroForm}
              </p>
            )}

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
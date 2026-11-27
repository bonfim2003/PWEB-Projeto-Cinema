import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, SearchX, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { Image } from "@/components/ui/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import PosterField from "@/components/admin/PosterField";
import TrailerField from "@/components/admin/TrailerField";
import { BotaoPrincipal, Cabecalho, Carregando, Erro, campo } from "@/components/admin/ui";
import { parseYoutube, youtubeWatchUrl } from "@/lib/youtube";

const VAZIO = {
  title: "",
  genre: "",
  synopsis: "",
  duration: "",
  year: "",
  director: "",
  rating: "Livre",
  bannerUrl: "",
  trailerUrl: "",
};
const CLASSIFICACOES = ["Livre", "10 anos", "12 anos", "14 anos", "16 anos", "18 anos"];

const doBanco = (f) => ({
  title: f.title || "",
  genre: f.genre || "",
  synopsis: f.synopsis || "",
  duration: f.duration || "",
  year: f.year || "",
  director: f.director || "",
  rating: f.rating || "Livre",
  bannerUrl: f.banner_url || "",
  trailerUrl: f.trailer_url || "",
});

export default function AdminFilmes() {
  const [filmes, setFilmes] = useState(null);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const carregar = () => api.filmes.listar().then(setFilmes);
  useEffect(() => {
    carregar();
  }, []);

  const abrir = (filme = null) => {
    setEditando(filme);
    setForm(filme ? doBanco(filme) : VAZIO);
    setErroForm("");
    setAberto(true);
  };

  const mudar = (chave) => (e) => setForm({ ...form, [chave]: e.target.value });

  const salvar = async (event) => {
    event.preventDefault();
    setErroForm("");
    const { id: trailerId, erro: trailerErro } = parseYoutube(form.trailerUrl);
    if (!trailerId) {
      setErroForm(trailerErro || "Informe o link do trailer no YouTube.");
      return;
    }
    setSalvando(true);
    try {
      const dados = { ...form, trailerUrl: youtubeWatchUrl(trailerId) };
      if (editando) await api.filmes.atualizar(editando.id, dados);
      else await api.filmes.criar(dados);
      toast({ title: editando ? "Filme atualizado" : "Filme cadastrado" });
      setAberto(false);
      await carregar();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (filme) => {
    if (!window.confirm(`Excluir "${filme.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.filmes.excluir(filme.id);
      toast({ title: "Filme excluído" });
      await carregar();
    } catch (e) {
      toast({ title: "Não foi possível excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Cabecalho
        sobre="catálogo"
        titulo="Filmes"
        acao={
          <BotaoPrincipal onClick={() => abrir()}>
            <Plus className="h-4 w-4" />
            Novo filme
          </BotaoPrincipal>
        }
      />

      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-ink bg-card">
        {!filmes ? (
          <Carregando />
        ) : filmes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <SearchX className="h-7 w-7 text-ink/30" />
            <p className="mt-3 text-sm text-ink/50">Nenhum filme cadastrado. Comece pelo botão Novo filme.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b-2 border-ink/10 text-xs text-ink/50">
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
                  <tr key={filme.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Image src={filme.banner_url} alt="" className="h-14 w-10 shrink-0 rounded border border-ink/20" />
                        <span className="font-semibold text-ink">{filme.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{filme.genre || "—"}</td>
                    <td className="px-5 py-3 text-ink/70">{filme.year || "—"}</td>
                    <td className="px-5 py-3 text-ink/70">{filme.duration ? `${filme.duration} min` : "—"}</td>
                    <td className="px-5 py-3 text-ink/70">{filme.rating || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => abrir(filme)} aria-label={`Editar ${filme.title}`} className="rounded-lg border-2 border-ink/20 p-2 text-ink hover:border-ink">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => excluir(filme)} aria-label={`Excluir ${filme.title}`} className="rounded-lg border-2 border-ink/20 p-2 text-ink hover:border-coral hover:bg-coral/20">
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
            <DialogTitle className="font-display text-2xl text-ink">{editando ? "Editar filme" : "Novo filme"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="titulo">Título</label>
                <input id="titulo" required value={form.title} onChange={mudar("title")} className={campo} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="genero">Gênero</label>
                <input id="genero" value={form.genre} onChange={mudar("genre")} placeholder="Comédia, Aventura..." className={campo} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="diretor">Direção</label>
                <input id="diretor" value={form.director} onChange={mudar("director")} className={campo} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="ano">Ano</label>
                <input id="ano" type="number" min="1890" max="2100" value={form.year} onChange={mudar("year")} className={campo} />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink" htmlFor="duracao">Duração (min)</label>
                <input id="duracao" type="number" min="1" value={form.duration} onChange={mudar("duration")} className={campo} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="classificacao">Classificação indicativa</label>
                <select id="classificacao" value={form.rating} onChange={mudar("rating")} className={campo}>
                  {CLASSIFICACOES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-ink" htmlFor="sinopse">Sinopse</label>
                <textarea id="sinopse" rows={4} value={form.synopsis} onChange={mudar("synopsis")} className={campo} />
              </div>
              <div className="rounded-2xl border-2 border-ink/15 p-4 sm:col-span-2">
                <PosterField value={form.bannerUrl} onChange={(url) => setForm({ ...form, bannerUrl: url })} />
              </div>
              <div className="sm:col-span-2">
                <TrailerField value={form.trailerUrl} onChange={(v) => setForm({ ...form, trailerUrl: v })} />
              </div>
            </div>

            <Erro>{erroForm}</Erro>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAberto(false)} className="rounded-full border-2 border-ink/25 px-5 py-2.5 text-sm font-semibold text-ink">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-60">
                {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                {editando ? "Salvar alterações" : "Cadastrar filme"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

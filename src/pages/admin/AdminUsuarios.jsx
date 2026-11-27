import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Cabecalho, Carregando, Erro, Etiqueta, campo } from "@/components/admin/ui";

const VAZIO = { name: "", email: "", password: "" };
const ROTULO = { ADMIN: "Admin", OPERADOR: "Operador", CLIENTE: "Cliente" };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = () => api.usuarios.listar().then(setUsuarios);
  useEffect(() => {
    carregar();
  }, []);

  const criar = async (event) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await api.usuarios.criarOperador(form);
      toast({ title: "Operador criado", description: `${form.email} já pode entrar e abrir a portaria.` });
      setForm(VAZIO);
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <Cabecalho sobre="equipe e público" titulo="Usuários" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card">
          {!usuarios ? (
            <Carregando />
          ) : (
            <ul className="divide-y divide-ink/10">
              {usuarios.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink/55">{u.email}</p>
                  </div>
                  <Etiqueta valor={u.role}>{ROTULO[u.role]}</Etiqueta>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={criar} className="h-fit space-y-4 rounded-2xl border-2 border-ink bg-card p-5">
          <div>
            <p className="font-display text-xl text-ink">Novo operador de portaria</p>
            <p className="mt-1 text-xs text-ink/55">
              O cadastro público sempre cria clientes. Operadores só podem ser criados aqui.
            </p>
          </div>
          <div>
            <label htmlFor="op-nome" className="text-sm font-semibold text-ink">Nome</label>
            <input id="op-nome" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={campo} />
          </div>
          <div>
            <label htmlFor="op-email" className="text-sm font-semibold text-ink">E-mail</label>
            <input id="op-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={campo} />
          </div>
          <div>
            <label htmlFor="op-senha" className="text-sm font-semibold text-ink">Senha inicial</label>
            <input id="op-senha" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={campo} />
            <p className="mt-1 text-xs text-ink/45">8+ caracteres, com maiúscula, minúscula e número.</p>
          </div>
          <Erro>{erro}</Erro>
          <button type="submit" disabled={enviando} className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-coral px-6 py-3 text-sm font-semibold text-ink shadow-block-sm disabled:opacity-60">
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Criar operador
          </button>
        </form>
      </div>
    </div>
  );
}

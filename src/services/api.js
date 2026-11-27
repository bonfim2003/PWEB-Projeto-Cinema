// Camada de comunicação com a API Express (server/). O token JWT vai no cabeçalho Authorization.
const TOKEN_KEY = "cine_token";
const USER_KEY = "cine_user";

export const sessaoLocal = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  salvar({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  limpar() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request(rota, { method = "GET", body, redirecionar = true } = {}) {
  const token = sessaoLocal.token();
  const resp = await fetch(`/api${rota}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const dados = await resp.json().catch(() => ({}));

  // token vencido ou inválido: limpa a sessão e manda para o login
  if (resp.status === 401 && token && redirecionar) {
    sessaoLocal.limpar();
    window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
  }
  if (!resp.ok) throw new Error(dados.erro || "Não foi possível falar com o servidor.");
  return dados;
}

const post = (rota, body = {}) => request(rota, { method: "POST", body });
const put = (rota, body) => request(rota, { method: "PUT", body });
const del = (rota) => request(rota, { method: "DELETE" });

export const api = {
  auth: {
    async login(email, password) {
      const dados = await post("/auth/login", { email, password });
      sessaoLocal.salvar(dados);
      return dados.user;
    },
    async cadastrar({ name, email, password }) {
      const dados = await post("/auth/cadastro", { name, email, password });
      sessaoLocal.salvar(dados);
      return dados.user;
    },
    me: () => request("/auth/me", { redirecionar: false }),
    sair() {
      sessaoLocal.limpar();
      window.location.href = "/";
    },
  },

  filmes: {
    listar: () => request("/filmes"),
    criar: (dados) => post("/filmes", dados),
    atualizar: (id, dados) => put(`/filmes/${id}`, dados),
    excluir: (id) => del(`/filmes/${id}`),
  },

  locais: {
    listar: () => request("/locais"),
    criar: (dados) => post("/locais", dados),
    atualizar: (id, dados) => put(`/locais/${id}`, dados),
    excluir: (id) => del(`/locais/${id}`),
  },

  sessoes: {
    listar: (filtro = {}) => {
      const qs = new URLSearchParams();
      if (filtro.localId) qs.set("localId", filtro.localId);
      if (filtro.movieId) qs.set("movieId", filtro.movieId);
      return request(`/sessoes${qs.toString() ? `?${qs}` : ""}`);
    },
    detalhe: (id) => request(`/sessoes/${id}`),
    gestao: () => request("/sessoes/gestao"),
    reservas: (id) => request(`/sessoes/${id}/reservas`),
    criar: ({ movieId, locationId, startsAt }) => post("/sessoes", { movieId, locationId, startsAt }),
    cancelar: (id, motivo) => post(`/sessoes/${id}/cancelar`, { motivo }),
  },

  reservas: {
    criar: ({ sessionId, sessionAreaId, quantidade }) =>
      post("/reservas", { sessionId, sessionAreaId, quantidade }),
    minhas: () => request("/reservas/minhas"),
    cancelar: (id) => post(`/reservas/${id}/cancelar`),
  },

  ingressos: {
    validar: (sessionId, codigo) => post("/ingressos/validar", { sessionId, codigo }),
    cancelar: (id) => post(`/ingressos/${id}/cancelar`),
  },

  avisos: {
    listar: () => request("/avisos"),
    marcarLido: (id) => post(`/avisos/${id}/lido`),
  },

  usuarios: {
    listar: () => request("/usuarios"),
    criarOperador: (dados) => post("/usuarios/operador", dados),
  },
};

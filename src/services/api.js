// Camada de comunicação com o backend Express + SQLite (server/index.js)

const USER_SESSION_KEY = "cine_user_session";

async function request(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? options.headers || {}
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erro na comunicação com o servidor.");
  }
  return data;
}

export const api = {
  auth: {
    async me() {
      try {
        const raw = localStorage.getItem(USER_SESSION_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        // Valida se o usuário ainda existe no SQLite
        const fresh = await request(`/api/auth/me/${encodeURIComponent(cached.id)}`);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(fresh));
        return fresh;
      } catch {
        localStorage.removeItem(USER_SESSION_KEY);
        return null;
      }
    },
    async login({ email, password }) {
      const user = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    },
    async register({ email, password, full_name }) {
      const user = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name }),
      });
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      return user;
    },
    logout() {
      localStorage.removeItem(USER_SESSION_KEY);
      window.location.href = "/";
    },
  },

  filmes: {
    async list() {
      return request("/api/filmes");
    },
    async get(id) {
      return request(`/api/filmes/${encodeURIComponent(id)}`);
    },
    async create(dados) {
      return request("/api/filmes", {
        method: "POST",
        body: JSON.stringify(dados),
      });
    },
    async update(id, dados) {
      return request(`/api/filmes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(dados),
      });
    },
    async delete(id) {
      return request(`/api/filmes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  sessoes: {
    async list(filtro = {}) {
      const params = new URLSearchParams();
      if (filtro.status) params.set("status", filtro.status);
      if (filtro.filme_id) params.set("filme_id", filtro.filme_id);
      const qs = params.toString();
      return request(`/api/sessoes${qs ? `?${qs}` : ""}`);
    },
    async create(payload, setoresIniciais = []) {
      return request("/api/sessoes", {
        method: "POST",
        body: JSON.stringify({ sessao: payload, setores: setoresIniciais }),
      });
    },
    async update(id, payload, setoresAtualizados = null) {
      return request(`/api/sessoes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ sessao: payload, setores: setoresAtualizados }),
      });
    },
    async delete(id) {
      return request(`/api/sessoes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  setores: {
    async listBySessao(sessaoId) {
      return request(`/api/setores?sessao_id=${encodeURIComponent(sessaoId)}`);
    },
    async listBySessoes(sessaoIds) {
      if (!sessaoIds?.length) return [];
      return request(`/api/setores?sessao_ids=${encodeURIComponent(sessaoIds.join(","))}`);
    },
  },

  reservas: {
    async list(filtro = {}) {
      const params = new URLSearchParams();
      if (filtro.user_id) params.set("user_id", filtro.user_id);
      if (filtro.status && filtro.status !== "todas") params.set("status", filtro.status);
      if (filtro.busca) params.set("busca", filtro.busca);
      const qs = params.toString();
      return request(`/api/reservas${qs ? `?${qs}` : ""}`);
    },
    async criar({ sessao_id, setor_id, nome, email, quantidade }) {
      const user = await api.auth.me();
      if (!user) throw new Error("Entre na sua conta para concluir a reserva.");

      return request("/api/reservas", {
        method: "POST",
        body: JSON.stringify({
          sessao_id,
          setor_id,
          user_id: user.id,
          nome,
          email,
          quantidade,
        }),
      });
    },
    async cancelar(reservaId) {
      return request(`/api/reservas/${encodeURIComponent(reservaId)}/cancelar`, {
        method: "PATCH",
      });
    },
  },

  uploads: {
    async uploadPoster(file) {
      const formData = new FormData();
      formData.append("poster", file);
      return request("/api/upload", {
        method: "POST",
        body: formData,
      });
    },
  },
};

import { createContext, useContext, useEffect, useState } from "react";
import { api, sessaoLocal } from "@/services/api";

const AuthContext = createContext(null);

export const PAPEIS = { CLIENTE: "CLIENTE", OPERADOR: "OPERADOR", ADMIN: "ADMIN" };

/** Para onde cada papel vai depois do login. */
export const inicioDoPapel = (role) =>
  role === PAPEIS.ADMIN ? "/admin" : role === PAPEIS.OPERADOR ? "/portaria" : "/";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(sessaoLocal.user());
  const [carregando, setCarregando] = useState(Boolean(sessaoLocal.token()));

  useEffect(() => {
    if (!sessaoLocal.token()) return;
    // confirma no servidor que o token ainda vale e atualiza nome/papel
    api.auth
      .me()
      .then(setUser)
      .catch(() => {
        sessaoLocal.limpar();
        setUser(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  const valor = {
    user,
    carregando,
    isAuthenticated: Boolean(user),
    temPapel: (...papeis) => Boolean(user && papeis.includes(user.role)),
    sair: () => {
      setUser(null);
      api.auth.sair();
    },
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

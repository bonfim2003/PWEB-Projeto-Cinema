import erro from "./erro.js";

/** Converte para inteiro positivo ou lança 400. O JSON pode trazer números como texto. */
export function idValido(valor, campo = "id") {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw erro(400, `Campo inválido: ${campo}`);
  return n;
}

export const texto = (valor, max = 500) => String(valor ?? "").trim().slice(0, max);

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Aceita apenas http(s); evita javascript: e afins em links exibidos no site. */
export function urlValida(valor) {
  if (!valor) return true;
  try {
    const u = new URL(valor);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validarSenha(senha) {
  const s = String(senha || "");
  if (s.length < 8) return "A senha deve ter pelo menos 8 caracteres";
  if (!/[A-Z]/.test(s)) return "A senha deve ter uma letra maiúscula";
  if (!/[a-z]/.test(s)) return "A senha deve ter uma letra minúscula";
  if (!/\d/.test(s)) return "A senha deve ter um número";
  return null;
}

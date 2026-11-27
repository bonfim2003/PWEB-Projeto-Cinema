import jwt from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? null : "segredo-de-desenvolvimento-troque-no-env");

if (!JWT_SECRET) {
  throw new Error("Defina a variável de ambiente JWT_SECRET antes de iniciar em produção.");
}

/** Exige um token válido no cabeçalho Authorization: Bearer <token>. */
export function auth(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado" });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { id, papel }
    next();
  } catch {
    res.status(401).json({ erro: "Sessão expirada. Entre novamente." });
  }
}

/** Libera a rota apenas para os papéis informados. Uso: auth, exigir("ADMIN") */
export const exigir =
  (...papeis) =>
  (req, res, next) =>
    papeis.includes(req.user?.papel)
      ? next()
      : res.status(403).json({ erro: "Sem permissão para esta operação" });

export function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, papel: usuario.role }, JWT_SECRET, { expiresIn: "8h" });
}

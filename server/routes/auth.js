import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import erro from "../erro.js";
import { auth, gerarToken } from "../middlewares/auth.js";
import { emailValido, texto, validarSenha } from "../validacao.js";

const router = Router();
const publico = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// O cadastro público sempre cria CLIENTE. Admin e operador vêm do seed ou do admin.
router.post("/cadastro", (req, res) => {
  const name = texto(req.body.name, 80);
  const email = texto(req.body.email, 120).toLowerCase();
  const { password } = req.body;

  if (name.length < 2) throw erro(400, "Informe seu nome");
  if (!emailValido(email)) throw erro(400, "E-mail inválido");
  const problemaSenha = validarSenha(password);
  if (problemaSenha) throw erro(400, problemaSenha);
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) throw erro(409, "E-mail já cadastrado");

  const hash = bcrypt.hashSync(password, 10);
  const id = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)") // papel padrão: CLIENTE
    .run(name, email, hash).lastInsertRowid;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  res.status(201).json({ token: gerarToken(user), user: publico(user) });
});

router.post("/login", (req, res) => {
  const email = texto(req.body.email, 120).toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(String(req.body.password || ""), user.password_hash))
    throw erro(401, "E-mail ou senha incorretos");

  res.json({ token: gerarToken(user), user: publico(user) });
});

router.get("/me", auth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) throw erro(401, "Usuário não encontrado");
  res.json(publico(user));
});

export default router;

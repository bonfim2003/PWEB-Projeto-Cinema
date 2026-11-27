import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import erro from "../erro.js";
import { auth, exigir } from "../middlewares/auth.js";
import { emailValido, texto, validarSenha } from "../validacao.js";

const router = Router();
router.use(auth, exigir("ADMIN"));

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY role, name").all());
});

router.post("/operador", (req, res) => {
  const name = texto(req.body.name, 80);
  const email = texto(req.body.email, 120).toLowerCase();
  if (name.length < 2) throw erro(400, "Informe o nome");
  if (!emailValido(email)) throw erro(400, "E-mail inválido");
  const problema = validarSenha(req.body.password);
  if (problema) throw erro(400, problema);
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) throw erro(409, "E-mail já cadastrado");

  const id = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'OPERADOR')")
    .run(name, email, bcrypt.hashSync(req.body.password, 10)).lastInsertRowid;
  res.status(201).json({ id: Number(id) });
});

export default router;

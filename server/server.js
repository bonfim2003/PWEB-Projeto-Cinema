import "dotenv/config"; // carrega o .env antes de qualquer outro módulo
import "express-async-errors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import db, { DB_PATH } from "./db.js";
import authRoutes from "./routes/auth.js";
import filmesRoutes from "./routes/filmes.js";
import locaisRoutes from "./routes/locais.js";
import sessoesRoutes from "./routes/sessoes.js";
import reservasRoutes from "./routes/reservas.js";
import ingressosRoutes from "./routes/ingressos.js";
import avisosRoutes from "./routes/avisos.js";
import usuariosRoutes from "./routes/usuarios.js";
import { semear } from "../db/seed.js";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pastaFront = path.join(raiz, "dist"); // gerada pelo `npm run build`

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/filmes", filmesRoutes);
app.use("/api/locais", locaisRoutes);
app.use("/api/sessoes", sessoesRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/ingressos", ingressosRoutes);
app.use("/api/avisos", avisosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api", (req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

// Aplicação única: o mesmo Express serve a API e o front-end (sem CORS, um só serviço no Render)
if (fs.existsSync(pastaFront)) {
  app.use(express.static(pastaFront));
  app.get("*", (req, res) => res.sendFile(path.join(pastaFront, "index.html"))); // rotas do React
}

app.use((err, req, res, _next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido" });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ erro: err.status ? err.message : "Erro interno" });
});

if (db.prepare("SELECT COUNT(*) AS n FROM users").get().n === 0) semear();

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`[SQLite] Banco em ${DB_PATH}`);
  console.log(`[API] Servidor no ar em http://localhost:${porta}`);
});

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initDatabase, all, get, run, transaction, newId, DB_PATH } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ==================== AUTH ====================
app.post("/api/auth/login", (req, res) => {
  const { email, password = "" } = req.body || {};
  if (!email) return res.status(400).json({ error: "Informe o e-mail." });

  const normalized = String(email).trim().toLowerCase();
  let user = get("SELECT id, email, full_name, role FROM usuarios WHERE LOWER(email) = ?", [
    normalized,
  ]);

  if (!user) {
    const id = newId();
    const role = normalized.includes("admin") ? "admin" : "user";
    const fullName = normalized.split("@")[0];
    run(
      `INSERT INTO usuarios (id, email, senha, full_name, role, created_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, normalized, String(password), fullName, role, new Date().toISOString()]
    );
    user = { id, email: normalized, full_name: fullName, role };
  }

  res.json(user);
});

app.post("/api/auth/register", (req, res) => {
  const { email, password = "", full_name } = req.body || {};
  if (!email) return res.status(400).json({ error: "Informe o e-mail." });

  const normalized = String(email).trim().toLowerCase();
  const existing = get("SELECT id, email, full_name, role FROM usuarios WHERE LOWER(email) = ?", [
    normalized,
  ]);
  if (existing) {
    return res.json(existing);
  }

  const id = newId();
  const role = normalized.includes("admin") ? "admin" : "user";
  const name = (full_name && String(full_name).trim()) || normalized.split("@")[0];
  run(
    `INSERT INTO usuarios (id, email, senha, full_name, role, created_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, normalized, String(password), name, role, new Date().toISOString()]
  );

  res.status(201).json({ id, email: normalized, full_name: name, role });
});

app.get("/api/auth/me/:id", (req, res) => {
  const user = get("SELECT id, email, full_name, role FROM usuarios WHERE id = ?", [req.params.id]);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  res.json(user);
});

// ==================== FILMES ====================
app.get("/api/filmes", (_req, res) => {
  const lista = all("SELECT * FROM filmes ORDER BY created_date DESC");
  res.json(lista);
});

app.get("/api/filmes/:id", (req, res) => {
  const filme = get("SELECT * FROM filmes WHERE id = ?", [req.params.id]);
  if (!filme) return res.status(404).json({ error: "Filme não encontrado." });
  res.json(filme);
});

app.post("/api/filmes", (req, res) => {
  const {
    titulo,
    genero = "",
    sinopse = "",
    duracao = 0,
    ano = 0,
    diretor = "",
    classificacao = "Livre",
    poster_url = "",
    trailer_url = "",
  } = req.body || {};

  if (!titulo) return res.status(400).json({ error: "Título é obrigatório." });

  const id = newId();
  const created_date = new Date().toISOString();
  run(
    `INSERT INTO filmes (id, titulo, genero, sinopse, duracao, ano, diretor, classificacao, poster_url, trailer_url, created_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      titulo,
      genero,
      sinopse,
      Number(duracao) || 0,
      Number(ano) || 0,
      diretor,
      classificacao,
      poster_url,
      trailer_url,
      created_date,
    ]
  );

  const criado = get("SELECT * FROM filmes WHERE id = ?", [id]);
  res.status(201).json(criado);
});

app.put("/api/filmes/:id", (req, res) => {
  const atual = get("SELECT * FROM filmes WHERE id = ?", [req.params.id]);
  if (!atual) return res.status(404).json({ error: "Filme não encontrado." });

  const dados = { ...atual, ...req.body };
  transaction(() => {
    run(
      `UPDATE filmes
       SET titulo = ?, genero = ?, sinopse = ?, duracao = ?, ano = ?, diretor = ?, classificacao = ?, poster_url = ?, trailer_url = ?
       WHERE id = ?`,
      [
        dados.titulo,
        dados.genero,
        dados.sinopse,
        Number(dados.duracao) || 0,
        Number(dados.ano) || 0,
        dados.diretor,
        dados.classificacao,
        dados.poster_url,
        dados.trailer_url,
        req.params.id,
      ],
      { skipPersist: true }
    );

    if (dados.titulo !== atual.titulo) {
      run(
        "UPDATE sessoes SET filme_titulo = ? WHERE filme_id = ?",
        [dados.titulo, req.params.id],
        { skipPersist: true }
      );
    }
  });

  res.json(get("SELECT * FROM filmes WHERE id = ?", [req.params.id]));
});

app.delete("/api/filmes/:id", (req, res) => {
  run("DELETE FROM filmes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ==================== SESSÕES ====================
app.get("/api/sessoes", (req, res) => {
  const { status, filme_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("status = ?");
    params.push(String(status));
  }
  if (filme_id) {
    conditions.push("filme_id = ?");
    params.push(String(filme_id));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const lista = all(`SELECT * FROM sessoes ${where} ORDER BY data ASC, horario ASC`, params);
  res.json(lista);
});

app.post("/api/sessoes", (req, res) => {
  const { sessao, setores = [] } = req.body || {};
  if (!sessao?.filme_id || !sessao?.data) {
    return res.status(400).json({ error: "Filme e data são obrigatórios." });
  }

  const id = newId();
  const created_date = new Date().toISOString();

  transaction(() => {
    run(
      `INSERT INTO sessoes (id, filme_id, filme_titulo, data, horario, local, status, created_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sessao.filme_id,
        sessao.filme_titulo || "",
        sessao.data,
        sessao.horario || "19h30",
        sessao.local || "Parque Aurora — Gramado principal",
        sessao.status || "ativa",
        created_date,
      ],
      { skipPersist: true }
    );

    for (const s of setores) {
      run(
        `INSERT INTO setores (id, sessao_id, nome, tipo, descricao, capacidade_total, vagas_disponiveis, ordem)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newId(),
          id,
          s.nome,
          s.tipo,
          s.descricao || "",
          Number(s.capacidade_total) || 0,
          Number(s.vagas_disponiveis ?? s.capacidade_total) || 0,
          Number(s.ordem) || 1,
        ],
        { skipPersist: true }
      );
    }
  });

  res.status(201).json(get("SELECT * FROM sessoes WHERE id = ?", [id]));
});

app.put("/api/sessoes/:id", (req, res) => {
  const { sessao, setores = null } = req.body || {};
  const atual = get("SELECT * FROM sessoes WHERE id = ?", [req.params.id]);
  if (!atual) return res.status(404).json({ error: "Sessão não encontrada." });

  const dados = { ...atual, ...sessao };

  transaction(() => {
    run(
      `UPDATE sessoes
       SET filme_id = ?, filme_titulo = ?, data = ?, horario = ?, local = ?, status = ?
       WHERE id = ?`,
      [
        dados.filme_id,
        dados.filme_titulo,
        dados.data,
        dados.horario,
        dados.local,
        dados.status,
        req.params.id,
      ],
      { skipPersist: true }
    );

    if (Array.isArray(setores)) {
      for (const s of setores) {
        if (s.id) {
          run(
            `UPDATE setores
             SET nome = ?, tipo = ?, descricao = ?, capacidade_total = ?, vagas_disponiveis = ?, ordem = ?
             WHERE id = ?`,
            [
              s.nome,
              s.tipo,
              s.descricao || "",
              Number(s.capacidade_total) || 0,
              Number(s.vagas_disponiveis) || 0,
              Number(s.ordem) || 1,
              s.id,
            ],
            { skipPersist: true }
          );
        } else {
          run(
            `INSERT INTO setores (id, sessao_id, nome, tipo, descricao, capacidade_total, vagas_disponiveis, ordem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newId(),
              req.params.id,
              s.nome,
              s.tipo,
              s.descricao || "",
              Number(s.capacidade_total) || 0,
              Number(s.vagas_disponiveis) || 0,
              Number(s.ordem) || 1,
            ],
            { skipPersist: true }
          );
        }
      }
    }
  });

  res.json(get("SELECT * FROM sessoes WHERE id = ?", [req.params.id]));
});

app.delete("/api/sessoes/:id", (req, res) => {
  run("DELETE FROM sessoes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ==================== SETORES ====================
app.get("/api/setores", (req, res) => {
  const { sessao_id, sessao_ids } = req.query;
  if (sessao_id) {
    const lista = all("SELECT * FROM setores WHERE sessao_id = ? ORDER BY ordem ASC", [
      String(sessao_id),
    ]);
    return res.json(lista);
  }
  if (sessao_ids) {
    const ids = String(sessao_ids)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ids.length) return res.json([]);
    const placeholders = ids.map(() => "?").join(",");
    const lista = all(
      `SELECT * FROM setores WHERE sessao_id IN (${placeholders}) ORDER BY ordem ASC`,
      ids
    );
    return res.json(lista);
  }
  res.json(all("SELECT * FROM setores ORDER BY ordem ASC"));
});

// ==================== RESERVAS ====================
app.get("/api/reservas", (req, res) => {
  const { user_id, status, busca } = req.query;
  const conditions = [];
  const params = [];

  if (user_id) {
    conditions.push("user_id = ?");
    params.push(String(user_id));
  }
  if (status && status !== "todas") {
    conditions.push("status = ?");
    params.push(String(status));
  }
  if (busca) {
    const q = `%${String(busca).toLowerCase()}%`;
    conditions.push(
      "(LOWER(nome) LIKE ? OR LOWER(email) LIKE ? OR LOWER(filme_titulo) LIKE ? OR LOWER(codigo) LIKE ?)"
    );
    params.push(q, q, q, q);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const lista = all(`SELECT * FROM reservas ${where} ORDER BY created_date DESC`, params);
  res.json(lista);
});

app.post("/api/reservas", (req, res) => {
  const { sessao_id, setor_id, user_id, nome, email, quantidade } = req.body || {};
  const qtd = Number(quantidade) || 1;

  if (!user_id) {
    return res.status(401).json({ error: "Entre na sua conta para concluir a reserva." });
  }
  if (!sessao_id || !setor_id || !nome || !email) {
    return res.status(400).json({ error: "Preencha todos os campos da reserva." });
  }

  try {
    const novaReserva = transaction(() => {
      const sessao = get("SELECT * FROM sessoes WHERE id = ?", [sessao_id]);
      if (!sessao || sessao.status === "cancelada") {
        throw new Error("Sessão indisponível.");
      }

      const setor = get("SELECT * FROM setores WHERE id = ? AND sessao_id = ?", [
        setor_id,
        sessao_id,
      ]);
      if (!setor || setor.vagas_disponiveis < qtd) {
        throw new Error("Vagas insuficientes neste setor.");
      }

      const filme = get("SELECT * FROM filmes WHERE id = ?", [sessao.filme_id]);
      const codigo = `AGL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const id = newId();
      const created_date = new Date().toISOString();

      run(
        "UPDATE setores SET vagas_disponiveis = vagas_disponiveis - ? WHERE id = ?",
        [qtd, setor.id],
        { skipPersist: true }
      );

      run(
        `INSERT INTO reservas
         (id, codigo, sessao_id, setor_id, user_id, filme_titulo, filme_poster, sessao_data, sessao_horario, local, setor_nome, nome, email, quantidade, status, created_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmada', ?)`,
        [
          id,
          codigo,
          sessao.id,
          setor.id,
          user_id,
          sessao.filme_titulo || filme?.titulo || "",
          filme?.poster_url || "",
          sessao.data,
          sessao.horario,
          sessao.local || "",
          setor.nome,
          String(nome).trim(),
          String(email).trim(),
          qtd,
          created_date,
        ],
        { skipPersist: true }
      );

      return get("SELECT * FROM reservas WHERE id = ?", [id]);
    });

    res.status(201).json(novaReserva);
  } catch (err) {
    res.status(400).json({ error: err.message || "Erro ao criar reserva." });
  }
});

app.patch("/api/reservas/:id/cancelar", (req, res) => {
  const reserva = get("SELECT * FROM reservas WHERE id = ?", [req.params.id]);
  if (!reserva) return res.status(404).json({ error: "Reserva não encontrada." });
  if (reserva.status === "cancelada") return res.json(reserva);

  const atualizada = transaction(() => {
    run("UPDATE reservas SET status = 'cancelada' WHERE id = ?", [reserva.id], {
      skipPersist: true,
    });
    run(
      `UPDATE setores
       SET vagas_disponiveis = MIN(capacidade_total, vagas_disponiveis + ?)
       WHERE id = ?`,
      [reserva.quantidade, reserva.setor_id],
      { skipPersist: true }
    );
    return get("SELECT * FROM reservas WHERE id = ?", [reserva.id]);
  });

  res.json(atualizada);
});

// ==================== UPLOAD DE PÔSTER ====================
app.post("/api/upload", upload.single("poster"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }
  res.json({ file_url: `/uploads/${req.file.filename}` });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[SQLite] Banco ativo em: ${DB_PATH}`);
    console.log(`[API] Servidor rodando em: http://localhost:${PORT}`);
  });
});

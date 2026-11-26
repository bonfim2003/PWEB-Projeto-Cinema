import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.join(__dirname, "database.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

let db = null;

function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

export function run(sql, params = [], { skipPersist = false } = {}) {
  db.run("PRAGMA foreign_keys = ON;");
  db.run(sql, params);
  if (!skipPersist) persist();
}

export function transaction(fn) {
  db.run("BEGIN TRANSACTION;");
  try {
    const result = fn();
    db.run("COMMIT;");
    persist();
    return result;
  } catch (err) {
    db.run("ROLLBACK;");
    throw err;
  }
}

function seedIfEmpty() {
  const countRow = get("SELECT COUNT(*) AS total FROM filmes");
  if (countRow && countRow.total > 0) return;

  const now = new Date().toISOString();
  const addDias = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  transaction(() => {
    // Usuários padrão (admin e visitante)
    run(
      `INSERT OR IGNORE INTO usuarios (id, email, senha, full_name, role, created_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["user-admin", "admin@cineafterglow.com.br", "admin123", "Produção Afterglow", "admin", now],
      { skipPersist: true }
    );
    run(
      `INSERT OR IGNORE INTO usuarios (id, email, senha, full_name, role, created_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ["user-demo", "visitante@cineafterglow.com.br", "123456", "Visitante Aurora", "user", now],
      { skipPersist: true }
    );

    const filmesIniciais = [
      {
        id: "filme-1",
        titulo: "De Volta para o Futuro",
        genero: "Ficção Científica · Aventura",
        sinopse:
          "Marty McFly, um adolescente típico dos anos 80, é acidentalmente enviado de volta a 1955 em um DeLorean movido a plutônio inventado pelo excêntrico cientista Doc Brown.",
        duracao: 116,
        ano: 1985,
        diretor: "Robert Zemeckis",
        classificacao: "Livre",
        poster_url:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
        trailer_url: "https://www.youtube.com/watch?v=qvsgGtivCgs",
      },
      {
        id: "filme-2",
        titulo: "Curtindo a Vida Adoidado",
        genero: "Comédia",
        sinopse:
          "Ferris Bueller decide tirar um dia de folga da escola em Chicago ao lado da namorada e do melhor amigo, transformando a cidade em seu parque de diversões particular.",
        duracao: 103,
        ano: 1986,
        diretor: "John Hughes",
        classificacao: "12 anos",
        poster_url:
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
        trailer_url: "https://www.youtube.com/watch?v=R-P6p86px6U",
      },
      {
        id: "filme-3",
        titulo: "Os Goonies",
        genero: "Aventura · Família",
        sinopse:
          "Um grupo de amigos encontra um mapa do tesouro pirata no sótão e embarca em uma jornada subterrânea cheia de armadilhas para salvar suas casas da demolição.",
        duracao: 114,
        ano: 1985,
        diretor: "Richard Donner",
        classificacao: "Livre",
        poster_url:
          "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
        trailer_url: "https://www.youtube.com/watch?v=hJ2j4oWdQtU",
      },
    ];

    for (const f of filmesIniciais) {
      run(
        `INSERT INTO filmes (id, titulo, genero, sinopse, duracao, ano, diretor, classificacao, poster_url, trailer_url, created_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          f.id,
          f.titulo,
          f.genero,
          f.sinopse,
          f.duracao,
          f.ano,
          f.diretor,
          f.classificacao,
          f.poster_url,
          f.trailer_url,
          now,
        ],
        { skipPersist: true }
      );
    }

    const sessoesIniciais = [
      {
        id: "sessao-1",
        filme_id: "filme-1",
        filme_titulo: "De Volta para o Futuro",
        data: addDias(2),
        horario: "19h30",
        local: "Parque Aurora — Gramado principal",
      },
      {
        id: "sessao-2",
        filme_id: "filme-2",
        filme_titulo: "Curtindo a Vida Adoidado",
        data: addDias(3),
        horario: "19h30",
        local: "Parque Aurora — Gramado principal",
      },
      {
        id: "sessao-3",
        filme_id: "filme-3",
        filme_titulo: "Os Goonies",
        data: addDias(9),
        horario: "19h30",
        local: "Parque Aurora — Gramado principal",
      },
    ];

    const setoresBase = [
      {
        nome: "Setor A",
        tipo: "Frontal",
        descricao: "Bem na frente do telão, para quem gosta de tela grande.",
        capacidade: 80,
        ordem: 1,
      },
      {
        nome: "Setor B",
        tipo: "Central",
        descricao: "O meio do gramado: distância perfeita e som equilibrado.",
        capacidade: 120,
        ordem: 2,
      },
      {
        nome: "Setor C",
        tipo: "Gramado",
        descricao: "Área descontraída, ideal para manta e cesta de picnic.",
        capacidade: 100,
        ordem: 3,
      },
      {
        nome: "Setor D",
        tipo: "Convivência",
        descricao: "Mais ao fundo, perto dos food trucks e da saída.",
        capacidade: 90,
        ordem: 4,
      },
    ];

    for (const s of sessoesIniciais) {
      run(
        `INSERT INTO sessoes (id, filme_id, filme_titulo, data, horario, local, status, created_date)
         VALUES (?, ?, ?, ?, ?, ?, 'ativa', ?)`,
        [s.id, s.filme_id, s.filme_titulo, s.data, s.horario, s.local, now],
        { skipPersist: true }
      );

      for (const st of setoresBase) {
        run(
          `INSERT INTO setores (id, sessao_id, nome, tipo, descricao, capacidade_total, vagas_disponiveis, ordem)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${s.id}-${st.ordem}`,
            s.id,
            st.nome,
            st.tipo,
            st.descricao,
            st.capacidade,
            st.capacidade,
            st.ordem,
          ],
          { skipPersist: true }
        );
      }
    }
  });
}

export async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.run(schema);
  persist();
  seedIfEmpty();
  return db;
}

export const newId = () => crypto.randomUUID();

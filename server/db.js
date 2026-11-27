// Abre o SQLite (um arquivo, sem servidor) e aplica o schema a cada inicialização.
// Usa o SQLite embutido no próprio Node (node:sqlite, Node 22.13+): nada para compilar ou baixar.
import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const caminho = process.env.DB_PATH || path.join(raiz, "data", "cinema.db");

fs.mkdirSync(path.dirname(caminho), { recursive: true });

const db = new DatabaseSync(caminho);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;"); // sem isso o SQLite ignora as chaves estrangeiras
db.exec(fs.readFileSync(path.join(raiz, "db", "schema.sql"), "utf8"));

/**
 * db.transaction(fn) devolve uma função que roda fn inteira dentro de uma transação:
 * se algo lançar erro, tudo é desfeito (ROLLBACK). Como o node:sqlite é síncrono,
 * nenhuma outra requisição roda no meio. Transações aninhadas viram SAVEPOINTs.
 */
let nivel = 0;
db.transaction = (fn) => (...args) => {
  const ponto = `sp_${nivel}`;
  db.exec(nivel === 0 ? "BEGIN" : `SAVEPOINT ${ponto}`);
  nivel++;
  try {
    const resultado = fn(...args);
    nivel--;
    db.exec(nivel === 0 ? "COMMIT" : `RELEASE ${ponto}`);
    return resultado;
  } catch (erro) {
    nivel--;
    db.exec(nivel === 0 ? "ROLLBACK" : `ROLLBACK TO ${ponto}; RELEASE ${ponto}`);
    throw erro;
  }
};

/** Erro de chave única (ex.: duas sessões no mesmo local e horário). */
export const ehErroDeUnicidade = (e) => /UNIQUE constraint failed/.test(e?.message || "");

export const DB_PATH = caminho;
export default db;

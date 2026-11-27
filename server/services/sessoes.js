// Consultas de sessão e cancelamento com aviso (RN10, RN11).
import db from "../db.js";
import erro from "../erro.js";

const SQL_SESSAO = `
  SELECT s.id, s.starts_at, s.status, s.cancel_reason,
         m.id AS movie_id, m.title, m.synopsis, m.rating, m.duration, m.genre, m.year,
         m.director, m.banner_url, m.trailer_url,
         l.id AS location_id, l.name AS local, l.address
    FROM sessions s
    JOIN movies m ON m.id = s.movie_id
    JOIN locations l ON l.id = s.location_id`;

const consultaAreas = () =>
  db.prepare(`
    SELECT sa.id, sa.name, sa.description, sa.capacity, sa.position,
           sa.capacity - (SELECT COUNT(*) FROM tickets t
                           WHERE t.session_area_id = sa.id
                             AND t.status IN ('VALIDO', 'UTILIZADO')) AS vagas
      FROM session_areas sa
     WHERE sa.session_id = ?
     ORDER BY sa.position, sa.id`);

/** Sessões abertas e futuras, com filme, local e vagas por área. */
export function listarSessoesAbertas({ localId = null, movieId = null } = {}) {
  const sessoes = db
    .prepare(
      `${SQL_SESSAO}
        WHERE s.status = 'ABERTA' AND s.starts_at > ?
          AND (? IS NULL OR s.location_id = ?)
          AND (? IS NULL OR s.movie_id = ?)
        ORDER BY s.starts_at`
    )
    .all(new Date().toISOString(), localId, localId, movieId, movieId);
  const areas = consultaAreas();
  return sessoes.map((s) => ({ ...s, areas: areas.all(s.id) }));
}

export function detalharSessao(id) {
  const sessao = db.prepare(`${SQL_SESSAO} WHERE s.id = ?`).get(id);
  if (!sessao) throw erro(404, "Sessão não encontrada");
  return { ...sessao, areas: consultaAreas().all(id) };
}

/** Visão de gestão (admin e portaria): todas as sessões, com contagens de ingressos. */
export function listarSessoesGestao() {
  return db
    .prepare(
      `SELECT s.id, s.starts_at, s.status, s.cancel_reason,
              m.title, m.banner_url, l.name AS local,
              (SELECT COALESCE(SUM(capacity), 0) FROM session_areas WHERE session_id = s.id) AS capacidade,
              (SELECT COUNT(*) FROM tickets WHERE session_id = s.id AND status = 'VALIDO') AS validos,
              (SELECT COUNT(*) FROM tickets WHERE session_id = s.id AND status = 'UTILIZADO') AS utilizados
         FROM sessions s
         JOIN movies m ON m.id = s.movie_id
         JOIN locations l ON l.id = s.location_id
        ORDER BY s.starts_at DESC`
    )
    .all();
}

/** Reservas e ingressos de uma sessão (admin e operador). */
export function reservasDaSessao(sessionId) {
  detalharSessao(sessionId); // 404 se não existir
  const reservas = db
    .prepare(
      `SELECT r.id, r.status, r.created_at, u.name AS cliente, u.email, sa.name AS area
         FROM reservations r
         JOIN users u ON u.id = r.user_id
         JOIN session_areas sa ON sa.id = r.session_area_id
        WHERE r.session_id = ?
        ORDER BY r.created_at`
    )
    .all(sessionId);
  const ingressos = db.prepare(
    "SELECT id, code, status, validated_at FROM tickets WHERE reservation_id = ? ORDER BY id"
  );
  return reservas.map((r) => ({ ...r, ingressos: ingressos.all(r.id) }));
}

export const criarSessao = db.transaction((movieId, locationId, inicio) => {
  if (!db.prepare("SELECT 1 FROM movies WHERE id = ?").get(movieId))
    throw erro(400, "Filme não encontrado");
  const areas = db
    .prepare("SELECT name, description, capacity, position FROM areas WHERE location_id = ? ORDER BY position, id")
    .all(locationId);
  if (areas.length === 0) throw erro(400, "O local precisa ter ao menos uma área");

  // cria a sessão e copia as áreas do local (RN10): alterar o local depois não afeta esta sessão
  const id = db
    .prepare("INSERT INTO sessions (movie_id, location_id, starts_at) VALUES (?, ?, ?)")
    .run(movieId, locationId, inicio).lastInsertRowid;
  const inserir = db.prepare(
    "INSERT INTO session_areas (session_id, name, description, capacity, position) VALUES (?, ?, ?, ?, ?)"
  );
  for (const a of areas) inserir.run(id, a.name, a.description, a.capacity, a.position);
  return Number(id);
});

export const cancelarSessao = db.transaction((sessionId, motivo) => {
  motivo = String(motivo || "").trim();
  if (motivo.length < 3) throw erro(400, "Informe o motivo do cancelamento");

  const s = db
    .prepare("SELECT s.*, m.title FROM sessions s JOIN movies m ON m.id = s.movie_id WHERE s.id = ?")
    .get(sessionId);
  if (!s || s.status === "CANCELADA") throw erro(400, "Sessão inexistente ou já cancelada");

  const usuarios = db
    .prepare("SELECT DISTINCT user_id FROM reservations WHERE session_id = ? AND status = 'ATIVA'")
    .all(sessionId);

  db.prepare("UPDATE sessions SET status = 'CANCELADA', cancel_reason = ? WHERE id = ?").run(motivo, sessionId);
  db.prepare(
    "UPDATE tickets SET status = 'CANCELADO' WHERE session_id = ? AND status IN ('VALIDO', 'UTILIZADO')"
  ).run(sessionId);
  db.prepare("UPDATE reservations SET status = 'CANCELADA' WHERE session_id = ? AND status = 'ATIVA'").run(sessionId);

  const quando = new Date(s.starts_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const msg = `A sessão de '${s.title}' (${quando}) foi cancelada. Motivo: ${motivo}. Se houver nova data, ela será publicada como uma nova sessão.`;
  const aviso = db.prepare("INSERT INTO notifications (user_id, session_id, message) VALUES (?, ?, ?)");
  for (const u of usuarios) aviso.run(u.user_id, sessionId, msg);

  return { notificados: usuarios.length };
});

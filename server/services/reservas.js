// Reserva e cancelamento (RN01–RN04, RN06). Tudo em transação: se algo falhar, nada é gravado.
// O node:sqlite é síncrono, então conferir vagas e gravar a reserva é atômico:
// a última vaga nunca é entregue duas vezes.
import db from "../db.js";
import erro from "../erro.js";
import { codigoUnico } from "./ingressos.js";

export const LIMITE_POR_SESSAO = 4;
const DUAS_HORAS = 2 * 60 * 60 * 1000;

export const reservar = db.transaction((userId, sessionId, sessionAreaId, qtd) => {
  if (!Number.isInteger(qtd) || qtd < 1 || qtd > LIMITE_POR_SESSAO)
    throw erro(400, `Quantidade deve ser de 1 a ${LIMITE_POR_SESSAO}`);

  const sessao = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
  if (!sessao || sessao.status !== "ABERTA" || sessao.starts_at <= new Date().toISOString())
    throw erro(400, "Sessão indisponível para reserva");

  const area = db
    .prepare("SELECT * FROM session_areas WHERE id = ? AND session_id = ?")
    .get(sessionAreaId, sessionId);
  if (!area) throw erro(404, "Área não encontrada nesta sessão");

  // RN02: no máximo 4 ingressos ativos por usuário nesta sessão (somando todas as reservas)
  const doUsuario = db
    .prepare(
      `SELECT COUNT(*) AS n FROM tickets t
         JOIN reservations r ON r.id = t.reservation_id
        WHERE r.user_id = ? AND t.session_id = ? AND t.status IN ('VALIDO', 'UTILIZADO')`
    )
    .get(userId, sessionId).n;
  if (doUsuario + qtd > LIMITE_POR_SESSAO) {
    const resta = LIMITE_POR_SESSAO - doUsuario;
    throw erro(
      400,
      resta > 0
        ? `Você já tem ${doUsuario} ingresso(s) nesta sessão e pode reservar mais ${resta}`
        : `Você já atingiu o limite de ${LIMITE_POR_SESSAO} ingressos nesta sessão`
    );
  }

  // RN04: vagas da área
  const ocupadas = db
    .prepare(
      "SELECT COUNT(*) AS n FROM tickets WHERE session_area_id = ? AND status IN ('VALIDO', 'UTILIZADO')"
    )
    .get(sessionAreaId).n;
  if (ocupadas + qtd > area.capacity) {
    const restam = Math.max(0, area.capacity - ocupadas);
    throw erro(409, restam > 0 ? `Restam apenas ${restam} vaga(s) nesta área` : "Esta área está esgotada");
  }

  const reservaId = db
    .prepare("INSERT INTO reservations (user_id, session_id, session_area_id) VALUES (?, ?, ?)")
    .run(userId, sessionId, sessionAreaId).lastInsertRowid;

  const inserir = db.prepare(
    "INSERT INTO tickets (code, reservation_id, session_id, session_area_id) VALUES (?, ?, ?, ?)"
  );
  const codigos = [];
  for (let i = 0; i < qtd; i++) {
    const codigo = codigoUnico();
    inserir.run(codigo, reservaId, sessionId, sessionAreaId);
    codigos.push(codigo);
  }
  return { reservaId: Number(reservaId), codigos };
});

export const cancelarReserva = db.transaction((userId, reservationId) => {
  const r = db
    .prepare(
      `SELECT r.*, s.starts_at FROM reservations r
         JOIN sessions s ON s.id = r.session_id
        WHERE r.id = ? AND r.user_id = ?`
    )
    .get(reservationId, userId); // filtra pelo dono: ninguém cancela reserva alheia
  if (!r) throw erro(404, "Reserva não encontrada");
  if (r.status !== "ATIVA") throw erro(400, "Reserva já cancelada");

  const usado = db
    .prepare("SELECT 1 FROM tickets WHERE reservation_id = ? AND status = 'UTILIZADO'")
    .get(reservationId);
  if (usado) throw erro(400, "Há ingressos desta reserva já utilizados");

  const limite = new Date(new Date(r.starts_at).getTime() - DUAS_HORAS);
  if (new Date() > limite) throw erro(400, "Cancelamento permitido até 2 horas antes da sessão");

  db.prepare("UPDATE tickets SET status = 'CANCELADO' WHERE reservation_id = ?").run(reservationId);
  db.prepare("UPDATE reservations SET status = 'CANCELADA' WHERE id = ?").run(reservationId);
  return { ok: true };
});

// Geração e validação dos códigos de ingresso (RN07, RN08, RN12).
import crypto from "crypto";
import db from "../db.js";
import erro from "../erro.js";

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0, O, 1, I, L

function gerarCodigo(tamanho = 8) {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) codigo += ALFABETO[crypto.randomInt(ALFABETO.length)];
  return codigo;
}

export function codigoUnico() {
  const existe = db.prepare("SELECT 1 FROM tickets WHERE code = ?");
  for (;;) {
    const codigo = gerarCodigo();
    if (!existe.get(codigo)) return codigo;
  }
}

/** Normaliza o que o operador digitou: maiúsculas, sem espaços ou hífens. */
export const normalizarCodigo = (valor) =>
  String(valor || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

export function validarIngresso(operadorId, sessionId, codigoDigitado) {
  const codigo = normalizarCodigo(codigoDigitado);
  if (codigo.length !== 8) throw erro(400, "O código tem 8 caracteres");

  const t = db
    .prepare(
      `SELECT t.*, u.name AS usuario, sa.name AS area
         FROM tickets t
         JOIN reservations r ON r.id = t.reservation_id
         JOIN users u ON u.id = r.user_id
         JOIN session_areas sa ON sa.id = t.session_area_id
        WHERE t.code = ?`
    )
    .get(codigo);

  if (!t) throw erro(404, "Código inexistente");
  if (t.session_id !== sessionId) throw erro(400, "Este código pertence a outra sessão");
  if (t.status === "CANCELADO") throw erro(400, "Ingresso cancelado");
  if (t.status === "UTILIZADO") {
    const quando = new Date(t.validated_at).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    throw erro(400, `Ingresso já utilizado em ${quando}`);
  }

  // update condicional: só muda se ainda estiver VALIDO (evita validação dupla)
  const r = db
    .prepare(
      `UPDATE tickets SET status = 'UTILIZADO', validated_at = ?, validated_by = ?
        WHERE id = ? AND status = 'VALIDO'`
    )
    .run(new Date().toISOString(), operadorId, t.id);
  if (r.changes === 0) throw erro(409, "Ingresso já foi utilizado");

  return { ok: true, codigo, nome: t.usuario, area: t.area };
}

/** Admin cancela um ingresso individual; se todos da reserva caírem, a reserva cai junto. */
export const cancelarIngresso = db.transaction((ticketId) => {
  const t = db.prepare("SELECT * FROM tickets WHERE id = ?").get(ticketId);
  if (!t) throw erro(404, "Ingresso não encontrado");
  if (t.status !== "VALIDO") throw erro(400, "Só é possível cancelar ingressos válidos");

  db.prepare("UPDATE tickets SET status = 'CANCELADO' WHERE id = ?").run(ticketId);

  const restantes = db
    .prepare("SELECT COUNT(*) AS n FROM tickets WHERE reservation_id = ? AND status <> 'CANCELADO'")
    .get(t.reservation_id).n;
  if (restantes === 0) {
    db.prepare("UPDATE reservations SET status = 'CANCELADA' WHERE id = ?").run(t.reservation_id);
  }
  return { ok: true };
});

import { Router } from "express";
import db from "../db.js";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido } from "../validacao.js";
import { cancelarReserva, reservar } from "../services/reservas.js";

const router = Router();
router.use(auth, exigir("CLIENTE"));

router.post("/", (req, res) => {
  // o dono da reserva vem do token, nunca do corpo da requisição
  const resultado = reservar(
    req.user.id,
    idValido(req.body.sessionId, "sessão"),
    idValido(req.body.sessionAreaId, "área"),
    Number(req.body.quantidade)
  );
  res.status(201).json(resultado);
});

router.get("/minhas", (req, res) => {
  const reservas = db
    .prepare(
      `SELECT r.id, r.status, r.created_at, r.session_id,
              s.starts_at, s.status AS sessao_status, s.cancel_reason,
              m.title, m.banner_url, l.name AS local, l.address, sa.name AS area
         FROM reservations r
         JOIN sessions s ON s.id = r.session_id
         JOIN movies m ON m.id = s.movie_id
         JOIN locations l ON l.id = s.location_id
         JOIN session_areas sa ON sa.id = r.session_area_id
        WHERE r.user_id = ?
        ORDER BY s.starts_at`
    )
    .all(req.user.id);
  const ingressos = db.prepare("SELECT id, code, status, validated_at FROM tickets WHERE reservation_id = ? ORDER BY id");
  res.json(reservas.map((r) => ({ ...r, ingressos: ingressos.all(r.id) })));
});

router.post("/:id/cancelar", (req, res) => {
  res.json(cancelarReserva(req.user.id, idValido(req.params.id)));
});

export default router;

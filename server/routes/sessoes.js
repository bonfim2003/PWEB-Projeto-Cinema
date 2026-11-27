import { Router } from "express";
import erro from "../erro.js";
import { ehErroDeUnicidade } from "../db.js";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido } from "../validacao.js";
import {
  cancelarSessao,
  criarSessao,
  detalharSessao,
  listarSessoesAbertas,
  listarSessoesGestao,
  reservasDaSessao,
} from "../services/sessoes.js";

const router = Router();

// Público: sessões abertas e futuras (filtros opcionais por local e filme)
router.get("/", (req, res) => {
  const localId = req.query.localId ? idValido(req.query.localId, "localId") : null;
  const movieId = req.query.movieId ? idValido(req.query.movieId, "movieId") : null;
  res.json(listarSessoesAbertas({ localId, movieId }));
});

// Gestão: todas as sessões, inclusive passadas e canceladas
router.get("/gestao", auth, exigir("ADMIN", "OPERADOR"), (req, res) => {
  res.json(listarSessoesGestao());
});

router.get("/:id", (req, res) => {
  res.json(detalharSessao(idValido(req.params.id)));
});

router.get("/:id/reservas", auth, exigir("ADMIN", "OPERADOR"), (req, res) => {
  res.json(reservasDaSessao(idValido(req.params.id)));
});

router.post("/", auth, exigir("ADMIN"), (req, res) => {
  const movieId = idValido(req.body.movieId, "filme");
  const locationId = idValido(req.body.locationId, "local");
  const data = new Date(req.body.startsAt);
  if (isNaN(data) || data <= new Date()) throw erro(400, "Informe uma data e hora futuras");

  try {
    res.status(201).json({ id: criarSessao(movieId, locationId, data.toISOString()) });
  } catch (e) {
    if (ehErroDeUnicidade(e)) throw erro(409, "Já existe sessão neste local e horário");
    throw e;
  }
});

router.post("/:id/cancelar", auth, exigir("ADMIN"), (req, res) => {
  res.json(cancelarSessao(idValido(req.params.id), req.body.motivo));
});

export default router;

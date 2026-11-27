import { Router } from "express";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido } from "../validacao.js";
import { cancelarIngresso, validarIngresso } from "../services/ingressos.js";

const router = Router();

router.post("/validar", auth, exigir("ADMIN", "OPERADOR"), (req, res) => {
  res.json(validarIngresso(req.user.id, idValido(req.body.sessionId, "sessão"), req.body.codigo));
});

router.post("/:id/cancelar", auth, exigir("ADMIN"), (req, res) => {
  res.json(cancelarIngresso(idValido(req.params.id)));
});

export default router;

import { Router } from "express";
import db from "../db.js";
import erro from "../erro.js";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido } from "../validacao.js";

const router = Router();
router.use(auth, exigir("CLIENTE"));

router.get("/", (req, res) => {
  res.json(
    db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id)
  );
});

router.post("/:id/lido", (req, res) => {
  const info = db
    .prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
    .run(idValido(req.params.id), req.user.id);
  if (info.changes === 0) throw erro(404, "Aviso não encontrado");
  res.json({ ok: true });
});

export default router;

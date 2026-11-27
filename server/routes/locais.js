import { Router } from "express";
import db from "../db.js";
import erro from "../erro.js";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido, texto } from "../validacao.js";

const router = Router();

function dadosDoLocal(body) {
  const name = texto(body.name, 120);
  const address = texto(body.address, 200);
  if (!name) throw erro(400, "Informe o nome do local");

  const areas = Array.isArray(body.areas) ? body.areas : [];
  if (areas.length === 0) throw erro(400, "Cadastre ao menos uma área");
  const nomes = new Set();
  const normalizadas = areas.map((a, i) => {
    const nome = texto(a.name, 60);
    const capacidade = Number(a.capacity);
    if (!nome) throw erro(400, `Área ${i + 1}: informe o nome`);
    if (!Number.isInteger(capacidade) || capacidade < 1 || capacidade > 5000)
      throw erro(400, `Área "${nome}": capacidade deve ser um número de 1 a 5000`);
    if (nomes.has(nome.toLowerCase())) throw erro(400, `Área "${nome}" repetida`);
    nomes.add(nome.toLowerCase());
    return { name: nome, description: texto(a.description, 200), capacity: capacidade, position: i + 1 };
  });
  return { name, address, areas: normalizadas };
}

const inserirAreas = (locationId, areas) => {
  const ins = db.prepare(
    "INSERT INTO areas (location_id, name, description, capacity, position) VALUES (?, ?, ?, ?, ?)"
  );
  for (const a of areas) ins.run(locationId, a.name, a.description, a.capacity, a.position);
};

router.get("/", (req, res) => {
  const locais = db.prepare("SELECT * FROM locations ORDER BY name").all();
  const areas = db.prepare("SELECT * FROM areas WHERE location_id = ? ORDER BY position, id");
  res.json(locais.map((l) => ({ ...l, areas: areas.all(l.id) })));
});

router.post("/", auth, exigir("ADMIN"), (req, res) => {
  const d = dadosDoLocal(req.body);
  const id = db.transaction(() => {
    const novo = db.prepare("INSERT INTO locations (name, address) VALUES (?, ?)").run(d.name, d.address)
      .lastInsertRowid;
    inserirAreas(novo, d.areas);
    return Number(novo);
  })();
  res.status(201).json({ id });
});

// Substitui nome, endereço e áreas. Sessões já criadas não mudam: elas têm cópia das áreas (RN10).
router.put("/:id", auth, exigir("ADMIN"), (req, res) => {
  const id = idValido(req.params.id);
  const d = dadosDoLocal(req.body);
  db.transaction(() => {
    const info = db.prepare("UPDATE locations SET name = ?, address = ? WHERE id = ?").run(d.name, d.address, id);
    if (info.changes === 0) throw erro(404, "Local não encontrado");
    db.prepare("DELETE FROM areas WHERE location_id = ?").run(id);
    inserirAreas(id, d.areas);
  })();
  res.json({ ok: true });
});

router.delete("/:id", auth, exigir("ADMIN"), (req, res) => {
  const id = idValido(req.params.id);
  if (db.prepare("SELECT 1 FROM sessions WHERE location_id = ?").get(id))
    throw erro(409, "Este local tem sessões cadastradas e não pode ser excluído");
  const info = db.prepare("DELETE FROM locations WHERE id = ?").run(id);
  if (info.changes === 0) throw erro(404, "Local não encontrado");
  res.json({ ok: true });
});

export default router;

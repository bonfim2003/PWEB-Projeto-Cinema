import { Router } from "express";
import db from "../db.js";
import erro from "../erro.js";
import { auth, exigir } from "../middlewares/auth.js";
import { idValido, texto, urlValida } from "../validacao.js";

const router = Router();

function dadosDoFilme(body) {
  const dados = {
    title: texto(body.title, 120),
    synopsis: texto(body.synopsis, 2000),
    rating: texto(body.rating, 20) || "Livre",
    duration: Number(body.duration) || null,
    genre: texto(body.genre, 80),
    year: Number(body.year) || null,
    director: texto(body.director, 120),
    banner_url: texto(body.bannerUrl, 1000),
    trailer_url: texto(body.trailerUrl, 1000),
  };
  if (!dados.title || !dados.trailer_url) throw erro(400, "Título e trailer são obrigatórios");
  if (!urlValida(dados.banner_url) || !urlValida(dados.trailer_url))
    throw erro(400, "Use links começando com http:// ou https://");
  return dados;
}

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM movies ORDER BY title").all());
});

router.get("/:id", (req, res) => {
  const filme = db.prepare("SELECT * FROM movies WHERE id = ?").get(idValido(req.params.id));
  if (!filme) throw erro(404, "Filme não encontrado");
  res.json(filme);
});

router.post("/", auth, exigir("ADMIN"), (req, res) => {
  const d = dadosDoFilme(req.body);
  const info = db
    .prepare(
      `INSERT INTO movies (title, synopsis, rating, duration, genre, year, director, banner_url, trailer_url)
       VALUES (@title, @synopsis, @rating, @duration, @genre, @year, @director, @banner_url, @trailer_url)`
    )
    .run(d);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

router.put("/:id", auth, exigir("ADMIN"), (req, res) => {
  const id = idValido(req.params.id);
  const d = dadosDoFilme(req.body);
  const info = db
    .prepare(
      `UPDATE movies SET title = @title, synopsis = @synopsis, rating = @rating, duration = @duration,
              genre = @genre, year = @year, director = @director, banner_url = @banner_url,
              trailer_url = @trailer_url
        WHERE id = @id`
    )
    .run({ ...d, id });
  if (info.changes === 0) throw erro(404, "Filme não encontrado");
  res.json({ ok: true });
});

router.delete("/:id", auth, exigir("ADMIN"), (req, res) => {
  const id = idValido(req.params.id);
  if (db.prepare("SELECT 1 FROM sessions WHERE movie_id = ?").get(id))
    throw erro(409, "Este filme tem sessões cadastradas e não pode ser excluído");
  const info = db.prepare("DELETE FROM movies WHERE id = ?").run(id);
  if (info.changes === 0) throw erro(404, "Filme não encontrado");
  res.json({ ok: true });
});

export default router;

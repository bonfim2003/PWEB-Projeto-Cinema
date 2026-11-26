PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS filmes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  genero TEXT DEFAULT '',
  sinopse TEXT DEFAULT '',
  duracao INTEGER DEFAULT 0,
  ano INTEGER DEFAULT 0,
  diretor TEXT DEFAULT '',
  classificacao TEXT DEFAULT 'Livre',
  poster_url TEXT DEFAULT '',
  trailer_url TEXT DEFAULT '',
  created_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessoes (
  id TEXT PRIMARY KEY,
  filme_id TEXT NOT NULL,
  filme_titulo TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  local TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada')),
  created_date TEXT NOT NULL,
  FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS setores (
  id TEXT PRIMARY KEY,
  sessao_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  capacidade_total INTEGER NOT NULL DEFAULT 0,
  vagas_disponiveis INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservas (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  sessao_id TEXT NOT NULL,
  setor_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  filme_titulo TEXT NOT NULL,
  filme_poster TEXT DEFAULT '',
  sessao_data TEXT NOT NULL,
  sessao_horario TEXT NOT NULL,
  local TEXT DEFAULT '',
  setor_nome TEXT NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada')),
  created_date TEXT NOT NULL,
  FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE CASCADE,
  FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

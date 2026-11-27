-- Cine Pipoca · schema do banco (SQLite)
-- Executado toda vez que o servidor inicia; IF NOT EXISTS evita recriar tabelas.
-- Datas em texto ISO UTC (new Date().toISOString()), que ordena e compara como texto.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (role IN ('CLIENTE', 'ADMIN', 'OPERADOR')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS movies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  synopsis    TEXT,
  rating      TEXT,              -- classificação indicativa, ex.: 12 anos
  duration    INTEGER,           -- minutos
  genre       TEXT,
  year        INTEGER,
  director    TEXT,
  banner_url  TEXT,
  trailer_url TEXT NOT NULL      -- link do YouTube
);

CREATE TABLE IF NOT EXISTS locations (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  address TEXT
);

CREATE TABLE IF NOT EXISTS areas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INTEGER NOT NULL CHECK (capacity > 0),
  position    INTEGER NOT NULL DEFAULT 1,
  UNIQUE (location_id, name)
);

CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id      INTEGER NOT NULL REFERENCES movies(id),
  location_id   INTEGER NOT NULL REFERENCES locations(id),
  starts_at     TEXT NOT NULL, -- ISO UTC
  status        TEXT NOT NULL DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'CANCELADA')),
  cancel_reason TEXT,
  UNIQUE (location_id, starts_at) -- RN09
);

-- cópia das áreas do local no momento da criação da sessão (RN10)
CREATE TABLE IF NOT EXISTS session_areas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INTEGER NOT NULL,
  position    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reservations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  session_id      INTEGER NOT NULL REFERENCES sessions(id),
  session_area_id INTEGER NOT NULL REFERENCES session_areas(id),
  status          TEXT NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'CANCELADA')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS tickets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  code            TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'VALIDO' CHECK (status IN ('VALIDO', 'UTILIZADO', 'CANCELADO')),
  reservation_id  INTEGER NOT NULL REFERENCES reservations(id),
  session_id      INTEGER NOT NULL REFERENCES sessions(id),      -- redundância proposital: facilita contagens
  session_area_id INTEGER NOT NULL REFERENCES session_areas(id),
  validated_at    TEXT,
  validated_by    INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  session_id INTEGER,
  message    TEXT NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_area    ON tickets (session_area_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_session ON tickets (session_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations (user_id, session_id);

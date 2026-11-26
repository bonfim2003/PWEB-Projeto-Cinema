# Cine Afterglow — PWEB Projeto Cinema (React + Express + SQLite)

**Equipe:** Andre, Murillo, Yasmin Bonfim

## Como rodar o projeto (Front-end + Banco SQLite)

1. Instale todas as dependências (não precisa instalar XAMPP nem MySQL):
   ```bash
   npm install
   ```

2. Inicie o servidor da API (SQLite) e o front-end juntos:
   ```bash
   npm run dev
   ```

3. Acesse o sistema no navegador:
   * **Site:** `http://localhost:5173`
   * **API:** `http://localhost:3001`
   * **Arquivo do banco SQLite:** gerado automaticamente em `server/database.sqlite`

## Acesso rápido para testes
* **Painel Administrativo (`/admin`):** entre com qualquer e-mail contendo `admin` (ex.: `admin@cineafterglow.com.br`).
* **Visitante:** entre com qualquer outro e-mail (ex.: `visitante@cineafterglow.com.br`).

## Estrutura do Banco de Dados (`server/schema.sql`)
* `usuarios` — contas de visitantes e administradores
* `filmes` — catálogo de filmes em cartaz
* `sessoes` — datas, horários e locais vinculados a cada filme
* `setores` — setores A, B, C e D de cada sessão com controle de capacidade e vagas
* `reservas` — ingressos reservados com código localizador e baixa/estorno automático de vagas

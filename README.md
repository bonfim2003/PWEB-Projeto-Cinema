# Cine Pipoca: cinema ao ar livre

**Equipe:** André Teodoro Machado, Murillo de Almeida Miranda, Yasmin Bonfim de Moraes
**Disciplina:** Programação Dinâmica para a Web · **Tema:** Do virtual ao presencial

Sistema web para reserva gratuita de lugares em sessões de cinema ao ar livre, realizadas em praças e parques. O cliente escolhe uma sessão e uma área do espaço, reserva até 4 ingressos e recebe um código para cada um. Na entrada, um operador digita o código e o sistema confirma a presença.

## Relação com o tema

O virtual organiza o presencial: a reserva online controla a lotação de cada área para que o espaço caiba todo mundo. O presencial fecha o ciclo virtual: o ingresso só é "usado" quando a pessoa chega e o código é validado na portaria pelo conferente. O código de 8 caracteres é basicamente o que junta o presencial e o virtual.
    
## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 18 + Vite, Tailwind CSS, Radix UI, lucide-react |
| Back-end | Node.js 22.13+, Express 4, express-async-errors |
| Banco | SQLite embutido no Node (`node:sqlite`), SQL direto, sem ORM |
| Autenticação | JWT (jsonwebtoken) + hash de senha com bcryptjs |
| Hospedagem | Render (um único Web Service: o Express serve a API e o front compilado) |

## Perfis e permissões

O Visitante pode: ver sessões e detalhes;
O Cliente pode: ver sessões e detalhes, reservar e cancelar a própria reserva e ver os "meus ingressos" e avisos;
O Operador pode: ver sessões e detalhes, validar entrada por código e ver reservas de uma sessão;
O Admin pode: ver sessões e detalhes, validar entrada por código, ver reservas de uma sessão, criar e cancelar sessões, cancelar ingresso individual e criar usuários operadores.

O cadastro público sempre cria CLIENTE. Todas as permissões são checadas no servidor pelos middlewares `auth` e `exigir(...)`; o front-end só esconde o que o usuário não pode usar.

## Regras de negócio principais

- Reservas são gratuitas e exigem login.
- No máximo 4 ingressos ativos por usuário em cada sessão, somando todas as reservas.
- A reserva só acontece se houver vagas na área, verificado dentro de uma transação.
- O cliente cancela a reserva inteira até 2 horas antes da sessão; as vagas voltam na hora.
- Cada código é único, aleatório, com 8 caracteres e sem caracteres ambíguos (0/O, 1/I/L), e só pode ser validado uma vez, na sessão correta.
- Não pode haver duas sessões no mesmo local e horário.
- As áreas do local são copiadas para a sessão quando ela é criada; editar o local depois não afeta sessões existentes.
- Cancelar uma sessão exige motivo, cancela todas as reservas e gera um aviso para cada cliente afetado.

## Como rodar localmente

Pré-requisitos: Node.js 22.13 ou mais novo (LTS) e Git. Não é preciso instalar banco de dados: o SQLite já vem dentro do Node.

```bash
npm install
cp .env.example .env      # e troque o JWT_SECRET
npm run dev               # API em :3000 e front (Vite) em :5173
```

Acesse http://localhost:5173. Na primeira execução o servidor cria `data/cinema.db`, aplica o schema e roda o seed. Para zerar o banco, apague a pasta `data/` e reinicie.

Para testar como em produção: `npm run build && npm start` e acesse http://localhost:3000.

## Usuários de demonstração

admin@cinema.com | Admin |
portaria@cinema.com | Operador de portaria |
cliente@cinema.com | Cliente (já tem reservas) |
marina@cinema.com | Cliente (já tem reservas, uma validada) |

O seed cria uma sessão que começa cerca de 1 hora depois que o servidor sobe, com reservas prontas, para demonstrar a portaria a qualquer momento.

## Deploy no Render

1. Web Service ligado ao repositório, runtime Node. O arquivo `.node-version` faz o Render usar o Node 22.
2. **Build command:** `npm install --include=dev && npm run build`
3. **Start command:** `npm start`
4. **Environment:** `JWT_SECRET` (frase longa e aleatória) e `NODE_ENV=production`. O Render define a `PORT`.

Limitação conhecida: no plano gratuito o disco é temporário. A cada novo deploy ou reinício o banco volta ao estado do seed. As saídas seriam um disco persistente (plano pago) ou migrar para PostgreSQL.

## Estrutura

```
db/
  schema.sql          criação das tabelas
  seed.js             dados de demonstração
server/
  server.js           Express: API + arquivos do front (dist/)
  db.js               abre o SQLite e aplica o schema
  erro.js, validacao.js
  middlewares/auth.js auth + exigir(papéis)
  services/           reservas, sessões, ingressos (regras em transação)
  routes/             auth, filmes, locais, sessoes, reservas, ingressos, avisos, usuarios
src/                  front-end React
  pages/              Home, SessaoDetalhe, Login, Register, MeusIngressos, Portaria, admin/*
  components/         identidade visual (decor/), sessão (film/), ingressos/, admin/
  services/api.js     fetch com o token no cabeçalho Authorization
```

## API

Respostas em JSON. Erros no formato `{ "erro": "mensagem" }` com status 400/401/403/404/409. Rotas protegidas usam `Authorization: Bearer <token>`.

| Método e rota | Quem | O que faz |
| --- | --- | --- |
| POST /api/auth/cadastro | público | Cria CLIENTE e devolve `{ token, user }` |
| POST /api/auth/login | público | Devolve `{ token, user }` |
| GET /api/auth/me | logado | Dados do usuário do token |
| GET /api/sessoes?localId=&movieId= | público | Sessões abertas e futuras, com vagas por área |
| GET /api/sessoes/:id | público | Detalhe da sessão |
| GET /api/sessoes/gestao | admin, operador | Todas as sessões, com contagens |
| GET /api/sessoes/:id/reservas | admin, operador | Reservas e ingressos da sessão |
| POST /api/sessoes | admin | Cria sessão copiando as áreas do local |
| POST /api/sessoes/:id/cancelar | admin | Cancela com motivo e gera avisos |
| GET, POST, PUT, DELETE /api/filmes | público (GET) / admin | CRUD de filmes |
| GET, POST, PUT, DELETE /api/locais | público (GET) / admin | CRUD de locais com áreas |
| POST /api/reservas | cliente | Reserva de 1 a 4 ingressos |
| GET /api/reservas/minhas | cliente | Reservas com códigos |
| POST /api/reservas/:id/cancelar | cliente | Cancela (regra das 2 h) |
| POST /api/ingressos/validar | admin, operador | Valida o código na portaria |
| POST /api/ingressos/:id/cancelar | admin | Cancela um ingresso |
| GET /api/avisos, POST /api/avisos/:id/lido | cliente | Avisos de cancelamento |
| GET /api/usuarios, POST /api/usuarios/operador | admin | Lista usuários e cria operador |

## Por que `node:sqlite`

A documentação previa o pacote `better-sqlite3`, mas ele depende de um arquivo compilado que é baixado na instalação e falhou em alguns computadores da equipe. O Node 22 já traz o SQLite embutido, com a mesma ideia (síncrono, SQL direto, `prepare().get/all/run`), então trocamos para ele: nenhuma dependência nativa, nada para compilar. As transações ficam em `server/db.js`, com `db.transaction(fn)`.

## Segurança

- Senhas com hash bcrypt; nunca em texto puro.
- Token JWT com expiração de 8 h; segredo em variável de ambiente.
- Autorização por papel e por dono do dado verificada no servidor (o dono da reserva vem do token, nunca do corpo da requisição).
- Consultas sempre parametrizadas (`?`), sem concatenar texto do usuário.
- Links de pôster e trailer aceitos apenas com `http(s)://`; o React escapa todo texto exibido.
**Link do deploy:** (preencher após o deploy)
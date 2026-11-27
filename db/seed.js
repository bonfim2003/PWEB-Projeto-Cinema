// Dados de demonstração. Roda sozinho quando o banco está vazio (local e no Render),
// então o ambiente sempre volta a um estado conhecido para a apresentação.
import bcrypt from "bcryptjs";
import db from "../server/db.js";
import { criarSessao } from "../server/services/sessoes.js";
import { reservar } from "../server/services/reservas.js";
import { validarIngresso } from "../server/services/ingressos.js";

export const SENHA_DEMO = "Cinema123";

/** Data/hora em Brasília (UTC-3) daqui a N dias, devolvida em ISO UTC. */
function emBrasilia(diasAFrente, hora, minuto = 0) {
  const agoraBR = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(agoraBR.getUTCFullYear(), agoraBR.getUTCMonth(), agoraBR.getUTCDate() + diasAFrente, hora + 3, minuto)
  ).toISOString();
}

/** Sessão "de hoje" para demonstrar a portaria: começa em ~1h, arredondado para 15 min. */
function daquiAPouco() {
  const passo = 15 * 60 * 1000;
  return new Date(Math.ceil((Date.now() + 70 * 60 * 1000) / passo) * passo).toISOString();
}

export function semear() {
  const hash = bcrypt.hashSync(SENHA_DEMO, 10);

  db.transaction(() => {
    const usuario = db.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    usuario.run("Produção Cine Pipoca", "admin@cinema.com", hash, "ADMIN");
    const operador = Number(usuario.run("Portaria Cine Pipoca", "portaria@cinema.com", hash, "OPERADOR").lastInsertRowid);
    const cliente = Number(usuario.run("Ana Cliente", "cliente@cinema.com", hash, "CLIENTE").lastInsertRowid);
    const marina = Number(usuario.run("Marina Souza", "marina@cinema.com", hash, "CLIENTE").lastInsertRowid);

    const filme = db.prepare(
      `INSERT INTO movies (title, synopsis, rating, duration, genre, year, director, banner_url, trailer_url)
       VALUES (@title, @synopsis, @rating, @duration, @genre, @year, @director, @banner_url, @trailer_url)`
    );
    const futuro = Number(
      filme.run({
        title: "De Volta para o Futuro",
        synopsis:
          "Marty McFly, um adolescente típico dos anos 80, é acidentalmente enviado de volta a 1955 em um DeLorean movido a plutônio inventado pelo excêntrico cientista Doc Brown.",
        rating: "Livre",
        duration: 116,
        genre: "Ficção científica",
        year: 1985,
        director: "Robert Zemeckis",
        banner_url: "https://image.tmdb.org/t/p/w1280/i996T0lI1fGtFEowiH3V6eZthL0.jpg",
        trailer_url: "https://www.youtube.com/watch?v=qvsgGtivCgs",
      }).lastInsertRowid
    );
    const ferris = Number(
      filme.run({
        title: "Curtindo a Vida Adoidado",
        synopsis:
          "Ferris Bueller decide tirar um dia de folga da escola em Chicago ao lado da namorada e do melhor amigo, transformando a cidade em seu parque de diversões particular.",
        rating: "12 anos",
        duration: 103,
        genre: "Comédia",
        year: 1986,
        director: "John Hughes",
        banner_url: "https://media.themoviedb.org/t/p/w440_and_h660_face/4HambjOlwbOp5BOmHR0ZAY8ijDm.jpg",
        trailer_url: "https://youtu.be/Of5TyBdeLeQ?si=jraQfRUjT0qxoCMq",
      }).lastInsertRowid
    );
    const goonies = Number(
      filme.run({
        title: "Os Goonies",
        synopsis:
          "Um grupo de amigos encontra um mapa do tesouro pirata no sótão e embarca em uma jornada subterrânea cheia de armadilhas para salvar suas casas da demolição.",
        rating: "Livre",
        duration: 114,
        genre: "Aventura",
        year: 1985,
        director: "Richard Donner",
        banner_url: "https://image.tmdb.org/t/p/original/6YGlQxEzEqQ5VYj64NvzbItXKPX.jpg",
        trailer_url: "https://youtu.be/eG2hX9Su7-w?si=JLDIPhizpRARlTNe",
      }).lastInsertRowid
    );
    const lalaland = Number(
      filme.run({
        title: "La La Land - Cantando Estações",
        synopsis:
          "O pianista Sebastian conhece a atriz Mia, e os dois se apaixonam perdidamente. Em busca de oportunidades para suas carreiras na competitiva Los Angeles, os jovens tentam fazer o relacionamento amoroso dar certo, enquanto perseguem fama e sucesso.",
        rating: "Livre",
        duration: 128,
        genre: "Musical/Drama/Comédia",
        year: 2017,
        director: "Damien Chazelle",
        banner_url: "https://www.themoviedb.org/t/p/w1280/AvMietG6xuobpSSdmVnKuTjv4bL.jpg",
        trailer_url: "https://youtu.be/0pdqf4P9MB8?si=qop3nqn5Szd-Xz5-",
      }).lastInsertRowid
    );
    const ultimato = Number(
      filme.run({
        title: "Vingadores: Ultimato",
        synopsis:
          "Após os eventos devastadores de 'Vingadores: Guerra Infinita', os heróis restantes se unem para reverter as ações de Thanos e restaurar a ordem no universo.",
        rating: "12 anos",
        duration: 181,
        genre: "Ação/Aventura/Ficção científica",
        year: 2019,
        director: "Anthony Russo, Joe Russo",
        banner_url: "https://www.themoviedb.org/t/p/w1280/9fRX8UKlIW7Lb9GqNsJVakWWFCi.jpg",
        trailer_url: "https://youtu.be/spJoZReeIeQ?si=IQRTjk3A2Fsos9DU",
      }).lastInsertRowid
    );
    const obsession = Number(
      filme.run({
        title: "Obsessão",
        synopsis:
          "Sem grandes pretensões, um romântico incurável compra um brinquedo que promete realizar desejos únicos. Ele quebra o artefato misterioso enquanto pede para conquistar a crush e consegue exatamente o que desejava, mas descobre que a consequência é sinistra.",
        rating: "18 anos",
        duration: 169,
        genre: "Suspense/Terror",
        year: 2026,
        director: "Curry Baker",
        banner_url: "https://www.themoviedb.org/t/p/w1280/wUc6IDf5ChjM1UyQye21qFBeJY0.jpg",
        trailer_url: "https://youtu.be/gMC8kkwbIQQ?si=H_XwJD9AEwoM6xVr",
      }).lastInsertRowid
    );
    const passageiros = Number(
      filme.run({
        title: "Passageiros",
        synopsis:
          "Durante uma viagem interestelar de 120 anos, a nave Avalon transporta milhares de passageiros em hibernação. No entanto, devido a um mal funcionamento, dois passageiros acordam 90 anos antes do previsto, enfrentando a solidão e o dilema de viver juntos ou sozinhos.",
        rating: "12 anos",
        duration: 116,
        genre: "Ficção científica/Drama/Romance",
        year: 2017,
        director: "Morten Tyldum",
        banner_url: "https://www.themoviedb.org/t/p/w1280/mCROV5jSrzPm1MS9BeffkO4IfNP.jpg",
        trailer_url: "https://youtu.be/zCTy32c2LSE?si=8wbwfzrXZhFF7ndH",
      }).lastInsertRowid
    );

    const local = db.prepare("INSERT INTO locations (name, address) VALUES (?, ?)");
    const area = db.prepare(
      "INSERT INTO areas (location_id, name, description, capacity, position) VALUES (?, ?, ?, ?, ?)"
    );
    const novoLocal = (nome, endereco, areas) => {
      const id = Number(local.run(nome, endereco).lastInsertRowid);
      areas.forEach(([n, d, c], i) => area.run(id, n, d, c, i + 1));
      return id;
    };

    const aurora = novoLocal("Parque Aurora", "Rua das Acácias, 120", [
      ["Setor A · Frontal", "Bem na frente do telão, para quem gosta de tela grande.", 80],
      ["Setor B · Central", "O meio do gramado: distância perfeita e som equilibrado.", 120],
      ["Setor C · Gramado", "Área descontraída, ideal para manta e cesta de piquenique.", 100],
      ["Setor D · Convivência", "Mais ao fundo, perto dos food trucks e da saída.", 90],
    ]);
    const coreto = novoLocal("Praça do Coreto", "Largo do Coreto, s/n", [
      ["Pista", "Cadeiras de praia e cangas em frente à tela.", 100],
      ["Pufes", "Pufes da produção, nas primeiras fileiras.", 30],
      ["Arquibancada", "Degraus do coreto, com vista do alto.", 40],
    ]);
    const mirante = novoLocal("Mirante da Represa", "Av. Beira-Lago, 900", [
      ["Gramado", "Encosta gramada voltada para a represa.", 120],
      ["Pufes", "Pufes perto da tela.", 30],
      ["Redes", "Duas redes entre as árvores. Disputadíssimas.", 2],
    ]);

    const hoje = criarSessao(ferris, coreto, daquiAPouco());
    criarSessao(futuro, aurora, emBrasilia(2, 19, 30));
    criarSessao(ferris, aurora, emBrasilia(3, 19, 30));
    criarSessao(goonies, mirante, emBrasilia(4, 20, 0));
    const futuro2 = criarSessao(futuro, coreto, emBrasilia(9, 19, 30));
    criarSessao(goonies, aurora, emBrasilia(10, 19, 30));
    criarSessao(lalaland, aurora, emBrasilia(5, 17, 30));
    criarSessao(ultimato, mirante, emBrasilia(7, 21, 30));
    criarSessao(obsession, mirante, emBrasilia(8, 20, 40));
    criarSessao(passageiros, aurora, emBrasilia(11, 18, 10));

    // reservas de exemplo: a sessão de hoje já tem gente para a portaria validar
    const areaDe = (sessaoId, nome) =>
      db.prepare("SELECT id FROM session_areas WHERE session_id = ? AND name = ?").get(sessaoId, nome).id;
    reservar(cliente, hoje, areaDe(hoje, "Pufes"), 2);
    reservar(cliente, futuro2, areaDe(futuro2, "Pista"), 1);
    const daMarina = reservar(marina, hoje, areaDe(hoje, "Pista"), 3);
    validarIngresso(operador, hoje, daMarina.codigos[0]); // um ingresso já usado, para demonstrar a recusa
  })();

  console.log(`[seed] Dados de demonstração criados (senha dos usuários: ${SENHA_DEMO})`);
}

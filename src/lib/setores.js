export const SETORES_PADRAO = [
  {
    chave: "A",
    nome: "Setor A",
    tipo: "Frontal",
    descricao: "Bem na frente do telão, para quem gosta de tela grande.",
    capacidade: 80,
    ordem: 1,
  },
  {
    chave: "B",
    nome: "Setor B",
    tipo: "Central",
    descricao: "O meio do gramado: distância perfeita e som equilibrado.",
    capacidade: 120,
    ordem: 2,
  },
  {
    chave: "C",
    nome: "Setor C",
    tipo: "Gramado",
    descricao: "Área descontraída, ideal para manta e cesta de picnic.",
    capacidade: 100,
    ordem: 3,
  },
  {
    chave: "D",
    nome: "Setor D",
    tipo: "Convivência",
    descricao: "Mais ao fundo, perto dos food trucks e da saída.",
    capacidade: 90,
    ordem: 4,
  },
];

export const CAPACIDADES_PADRAO = SETORES_PADRAO.reduce((acc, setor) => {
  acc[setor.chave] = setor.capacidade;
  return acc;
}, {});
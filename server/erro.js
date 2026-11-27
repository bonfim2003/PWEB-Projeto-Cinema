// Cria um erro com status HTTP. O handler do server.js devolve { erro: mensagem }.
export default function erro(status, mensagem) {
  return Object.assign(new Error(mensagem), { status });
}

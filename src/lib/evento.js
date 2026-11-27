// Datas ficam em UTC no banco e são exibidas no horário de Brasília.
const FUSO = "America/Sao_Paulo";

const fmt = (iso, opcoes) => (iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO, ...opcoes }) : "");

/** "sex., 28 de nov." */
export const formatarData = (iso) => fmt(iso, { weekday: "short", day: "numeric", month: "short" });

/** "28 de novembro de 2026" */
export const formatarDataLonga = (iso) => fmt(iso, { day: "numeric", month: "long", year: "numeric" });

/** "19:30" */
export const formatarHora = (iso) => fmt(iso, { hour: "2-digit", minute: "2-digit" });

/** "28/11/2026, 19:30" */
export const formatarDataHora = (iso) => fmt(iso, { dateStyle: "short", timeStyle: "short" });

/** Chave do dia em Brasília (AAAA-MM-DD), usada para agrupar a agenda. */
export const chaveDia = (data) => new Date(data).toLocaleDateString("en-CA", { timeZone: FUSO });

export const vagasTotais = (areas = []) => areas.reduce((t, a) => t + Math.max(0, Number(a.vagas) || 0), 0);

export function nivelDisponibilidade(area) {
  const vagas = Number(area.vagas) || 0;
  const total = Number(area.capacity) || 0;
  if (vagas <= 0) return "esgotado";
  if (vagas <= Math.max(2, Math.round(total * 0.18))) return "poucas";
  return "disponivel";
}

/** RN06: o cliente cancela até 2 horas antes. O servidor confere de novo. */
export const podeCancelar = (inicioIso) => new Date(inicioIso).getTime() - Date.now() > 2 * 60 * 60 * 1000;

export const LIMITE_INGRESSOS = 4;

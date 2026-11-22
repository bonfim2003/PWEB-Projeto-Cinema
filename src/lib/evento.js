import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarData(data) {
  if (!data) return "";
  try {
    return format(parseISO(data), "EEE, d 'de' MMM", { locale: ptBR });
  } catch {
    return data;
  }
}

export function formatarDataLonga(data) {
  if (!data) return "";
  try {
    return format(parseISO(data), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return data;
  }
}

export function nivelDisponibilidade(setor) {
  const vagas = Number(setor.vagas_disponiveis) || 0;
  const total = Number(setor.capacidade_total) || 0;
  if (vagas <= 0) return "esgotado";
  if (vagas <= Math.max(8, Math.round(total * 0.18))) return "poucas";
  return "disponivel";
}
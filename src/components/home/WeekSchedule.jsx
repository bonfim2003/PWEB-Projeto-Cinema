import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Image } from "@/components/ui/image";
import SectionHeading from "@/components/decor/SectionHeading";
import { ArrowRight, CalendarOff, Clock3, MapPin } from "lucide-react";

export default function WeekSchedule({ sessoes = [], filmes = [] }) {
  const hoje = useMemo(() => {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data;
  }, []);

  const totalDias = useMemo(() => {
    if (!sessoes.length) return 21;
    const ultima = sessoes.reduce(
      (maior, sessao) => sessao.data > maior ? sessao.data : maior,
      ""
    );
    if (!ultima) return 21;
    const diferenca = differenceInCalendarDays(parseISO(ultima), hoje);
    return Math.min(42, Math.max(21, diferenca + 1));
  }, [sessoes, hoje]);

  const dias = useMemo(
    () => Array.from({ length: totalDias }, (_, i) => addDays(hoje, i)),
    [hoje, totalDias]
  );

  const sessoesDoDia = (dia) =>
  sessoes.filter((sessao) => sessao.data === format(dia, "yyyy-MM-dd"));

  const primeiroComSessao = useMemo(
    () => dias.find((dia) => sessoesDoDia(dia).length > 0) || dias[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dias, sessoes]
  );

  const [selecionado, setSelecionado] = useState(format(primeiroComSessao, "yyyy-MM-dd"));

  const diaSelecionado = dias.find((dia) => format(dia, "yyyy-MM-dd") === selecionado);
  const lista = diaSelecionado ? sessoesDoDia(diaSelecionado) : [];

  const filmeDe = (sessao) => filmes.find((filme) => filme.id === sessao.filme_id);

  return null;














































































































































}
import { useState } from "react";
import { Check, Copy } from "lucide-react";

const ESTILO_STATUS = {
  VALIDO: { rotulo: "Válido", classe: "bg-lagoon/40" },
  UTILIZADO: { rotulo: "Utilizado", classe: "bg-mustard/60" },
  CANCELADO: { rotulo: "Cancelado", classe: "bg-blush/50 line-through" },
};

/** Um código de 8 caracteres exibido em dois blocos (ABCD EFGH) para ler em voz alta na portaria. */
export default function CodigoIngresso({ codigo, status = "VALIDO", grande = false }) {
  const [copiado, setCopiado] = useState(false);
  const estilo = ESTILO_STATUS[status] || ESTILO_STATUS.VALIDO;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      /* navegador sem permissão de área de transferência */
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar código ${codigo}`}
        className={`inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-cream px-3 py-1.5 font-display font-bold tracking-[0.18em] text-ink transition-colors hover:bg-mustard/40 ${
          grande ? "text-2xl sm:text-3xl" : "text-base"
        } ${status === "CANCELADO" ? "line-through opacity-60" : ""}`}
      >
        {codigo.slice(0, 4)}
        <span className="text-ink/30">·</span>
        {codigo.slice(4)}
        {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5 text-ink/40" />}
      </button>
      <span className={`rounded-full border border-ink/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-retro text-ink ${estilo.classe.replace(" line-through", "")}`}>
        {estilo.rotulo}
      </span>
    </div>
  );
}

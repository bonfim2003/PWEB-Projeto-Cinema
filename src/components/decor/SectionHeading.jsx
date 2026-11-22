/** Cabeçalho editorial: rubrica em serifada itálica + título display. */
export default function SectionHeading({
  eyebrow,
  titulo,
  descricao,
  action,
  className = "",
  tone = "dark",
}) {
  const claro = tone === "light";
  return (
    <div className={`flex flex-wrap items-end justify-between gap-6 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p
            className={`font-serif text-xl italic ${
              claro ? "text-cream/70" : "text-plum"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`mt-1 font-display text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-[3.4rem] ${
            claro ? "text-cream" : "text-ink"
          }`}
        >
          {titulo}
        </h2>
        {descricao && (
          <p
            className={`mt-4 max-w-xl text-base leading-relaxed ${
              claro ? "text-cream/70" : "text-ink/65"
            }`}
          >
            {descricao}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
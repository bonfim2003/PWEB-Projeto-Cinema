export default function SectionHeading({ eyebrow, titulo, descricao, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-xl">
        {eyebrow && (
          <p className="font-serif text-xl italic text-plum">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-4xl font-semibold leading-[0.95] text-ink sm:text-5xl">
          {titulo}
        </h2>
        {descricao && (
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            {descricao}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

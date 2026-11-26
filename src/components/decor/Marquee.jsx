export default function Marquee({ items = [] }) {
  const repetidos = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-cream">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap">
        {repetidos.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-8 text-xs font-semibold uppercase tracking-retro"
          >
            <span>{item}</span>
            <span className="h-2 w-2 rounded-full bg-mustard" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}

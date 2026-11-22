const TONS = {
  mustard: "bg-mustard/80",
  coral: "bg-coral/80",
  lagoon: "bg-lagoon/80",
  blush: "bg-blush/80",
  cream: "bg-cream/90",
};

/** Fita adesiva de colagem — usada para "prender" fotos e recortes. */
export default function Tape({ tone = "mustard", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block h-6 w-24 border border-ink/10 ${TONS[tone] || TONS.mustard} ${className}`}
      style={{ clipPath: "polygon(0 12%, 100% 0, 97% 88%, 3% 100%)" }}
    />
  );
}
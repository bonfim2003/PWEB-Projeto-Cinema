import { Link } from "react-router-dom";

/** Marca do Cine Afterglow: monograma + assinatura editorial. */
export default function Brand({ tone = "dark", compact = false, className = "" }) {
  const claro = tone === "light";

  return (
    <Link to="/" className={`group flex items-center gap-3 ${className}`}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mustard transition-transform duration-300 group-hover:-rotate-6">
        <span className="font-display text-sm font-bold tracking-tight text-ink">
          CA
        </span>
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-ink bg-coral" />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-lg font-bold tracking-tight sm:text-xl ${
            claro ? "text-cream" : "text-ink"
          }`}
        >
          CINE AFTERGLOW
        </span>
        {!compact && (
          <span
            className={`mt-1 block font-serif text-xs italic ${
              claro ? "text-cream/60" : "text-plum"
            }`}
          >
            cinema ao ar livre
          </span>
        )}
      </span>
    </Link>
  );
}
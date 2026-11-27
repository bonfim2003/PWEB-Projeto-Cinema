import { Link } from "react-router-dom";

/** Marca do Cine Pipoca: logo + assinatura editorial. */
export default function Brand({ tone = "dark", compact = false, className = "" }) {
  const claro = tone === "light";

  return (
    <Link to="/" className={`group flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Logo Cine Pipoca"
        className="h-11 w-11 shrink-0 rounded-full border-2 border-ink object-cover transition-transform duration-300 group-hover:-rotate-6"
      />
      <span className="leading-none">
        <span
          className={`block font-display text-lg font-bold tracking-tight sm:text-xl ${
            claro ? "text-cream" : "text-ink"
          }`}
        >
          CINE PIPOCA
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
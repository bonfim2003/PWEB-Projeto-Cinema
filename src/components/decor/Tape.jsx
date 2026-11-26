const TONES = {
  mustard: "bg-mustard/85",
  coral: "bg-coral/85",
  lagoon: "bg-lagoon/85",
  blush: "bg-blush/85",
  cream: "bg-cream/90",
};

export default function Tape({ tone = "mustard", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 h-6 w-24 border border-ink/25 shadow-sm backdrop-blur-[1px] ${
        TONES[tone] || TONES.mustard
      } ${className}`}
    />
  );
}

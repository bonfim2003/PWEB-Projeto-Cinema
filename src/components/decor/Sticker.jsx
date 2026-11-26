const TONES = {
  mustard: "bg-mustard text-ink",
  coral: "bg-coral text-ink",
  lagoon: "bg-lagoon text-ink",
  blush: "bg-blush text-ink",
  cream: "bg-cream text-ink",
};

export default function Sticker({ tone = "mustard", className = "", children }) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-full border-2 border-ink text-center font-display text-[11px] font-bold uppercase leading-[1.05] tracking-tight shadow-block-sm ${
        TONES[tone] || TONES.mustard
      } ${className}`}
    >
      {children}
    </span>
  );
}

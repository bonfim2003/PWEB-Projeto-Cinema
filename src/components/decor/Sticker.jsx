const TONS = {
  coral: "bg-coral text-ink",
  mustard: "bg-mustard text-ink",
  lagoon: "bg-lagoon text-ink",
  blush: "bg-blush text-ink",
  cream: "bg-cream text-ink",
  ink: "bg-ink text-cream",
};

/** Selo circular de revista — "adesivo" com borda pontilhada. */
export default function Sticker({
  children,
  tone = "coral",
  className = "",
  ring = true,
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-2 border-ink text-center text-[10px] font-semibold uppercase leading-tight tracking-retro ${
        TONS[tone] || TONS.coral
      } ${ring ? "p-[3px]" : ""} ${className}`}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-ink/40 px-3 py-2">
        {children}
      </span>
    </span>
  );
}
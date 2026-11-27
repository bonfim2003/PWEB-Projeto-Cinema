import { Image } from "@/components/ui/image";

/** Link da imagem do pôster (banner_url), com prévia. */
export default function PosterField({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="w-20 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-cream p-1">
        {value ? (
          <Image src={value} alt="Prévia do pôster" className="aspect-[2/3] w-full" />
        ) : (
          <div className="aspect-[2/3] w-full bg-ink/10" />
        )}
      </div>
      <div className="min-w-[220px] flex-1">
        <label className="text-sm font-semibold text-ink" htmlFor="poster">
          Link do pôster
        </label>
        <input
          id="poster"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
        />
        <p className="mt-1 text-xs text-ink/45">Cole o endereço de uma imagem vertical (proporção 2:3).</p>
      </div>
    </div>
  );
}

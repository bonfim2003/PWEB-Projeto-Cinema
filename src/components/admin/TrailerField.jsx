import { useState } from "react";
import {
  parseYoutube,
  youtubeEmbedUrl,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from "@/lib/youtube";
import { AlertCircle, Check, Play, RotateCcw } from "lucide-react";

export default function TrailerField({ value, onChange }) {
  const { id, erro } = parseYoutube(value);
  const [tocando, setTocando] = useState(false);

  return (
    <div>
      <label className="text-sm font-semibold text-ink" htmlFor="trailer">
        Trailer do YouTube
      </label>
      <input
        id="trailer"
        value={value}
        onChange={(event) => {
          setTocando(false);
          onChange(event.target.value);
        }}
        placeholder="https://www.youtube.com/watch?v=..."
        className="mt-1 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
      />
      <p className="mt-1 text-xs text-ink/45">
        Aceita links do navegador, youtu.be, /shorts e /embed. O link é
        convertido automaticamente para o formato incorporado.
      </p>

      {erro && (
        <p className="mt-2 flex items-start gap-2 rounded-xl border-2 border-coral bg-coral/20 px-3 py-2 text-xs text-ink">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {erro}
        </p>
      )}

      {!erro && id && (
        <div className="mt-3 rounded-xl border-2 border-ink/20 bg-cream p-2">
          <div className="flex items-center gap-2 px-1 pb-2">
            <Check className="h-3.5 w-3.5 text-ink/60" />
            <p className="flex-1 text-xs font-medium text-ink">
              Link válido · vídeo {id}
            </p>
            <button
              type="button"
              onClick={() => setTocando((atual) => !atual)}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-retro text-ink transition-colors hover:border-ink"
            >
              {tocando ? (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Fechar
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Prévia
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-ink/15 bg-ink">
            {tocando ? (
              <div className="aspect-video w-full">
                <iframe
                  src={youtubeEmbedUrl(id)}
                  title="Prévia do trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTocando(true)}
                className="group relative block w-full"
                aria-label="Carregar prévia do trailer"
              >
                <img
                  src={youtubeThumbUrl(id)}
                  alt="Prévia do trailer"
                  className="aspect-video w-full object-cover opacity-90"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cream bg-cream/90">
                    <Play className="h-4 w-4 fill-ink text-ink" />
                  </span>
                </span>
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-ink/45">
            Se a prévia não carregar, o vídeo pode ter a incorporação bloqueada
            pelo canal.{" "}
            <a
              href={youtubeWatchUrl(id)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Abrir no YouTube
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
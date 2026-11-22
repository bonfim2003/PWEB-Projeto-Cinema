import { youtubeEmbedUrl, youtubeId, youtubeWatchUrl } from "@/lib/youtube";
import { Play } from "lucide-react";

export default function TrailerEmbed({ url, titulo, className = "" }) {
  const id = youtubeId(url);

  if (!id) {
    return (
      <div
        className={`flex aspect-video w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/25 bg-paper/50 text-center ${className}`}
      >
        <Play className="h-6 w-6 text-ink/30" />
        <p className="text-sm text-ink/50">Trailer ainda não cadastrado</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border-2 border-ink bg-ink shadow-block-sm ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={youtubeEmbedUrl(id)}
          title={`Trailer de ${titulo}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-ink bg-cream px-3 py-2">
        <p className="text-[10px] uppercase tracking-retro text-ink/50">
          Trailer oficial
        </p>
        <a
          href={youtubeWatchUrl(id)}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold text-ink transition-colors hover:text-coral"
        >
          Abrir no YouTube ↗
        </a>
      </div>
    </div>
  );
}
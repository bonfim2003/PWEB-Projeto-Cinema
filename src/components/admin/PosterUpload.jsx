import { useRef, useState } from "react";
import { api } from "@/services/api";
import { Image } from "@/components/ui/image";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

const TIPOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const TAMANHO_MAX = 5 * 1024 * 1024;

export default function PosterUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState(false);

  const enviarArquivo = async (file) => {
    if (!file) return;
    setErro("");

    if (!TIPOS.includes(file.type)) {
      setErro("Formato inválido. Envie uma imagem JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > TAMANHO_MAX) {
      setErro("A imagem precisa ter no máximo 5 MB.");
      return;
    }

    setEnviando(true);
    try {
      const { file_url } = await api.uploads.uploadPoster(file);
      onChange(file_url);
    } catch {
      setErro("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-ink">Pôster do filme</p>
      <p className="mt-1 text-xs text-ink/50">
        Envie um arquivo do computador (JPG, PNG ou WEBP, até 5 MB). A imagem
        fica guardada na plataforma e continua disponível depois.
      </p>

      {value ? (
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="w-24 overflow-hidden rounded-lg border-2 border-ink bg-cream p-1">
            <Image
              src={value}
              alt="Prévia do pôster"
              className="aspect-[2/3] w-full"
              fittingType="fill"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-mustard disabled:opacity-60"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Trocar imagem
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setErro("");
              }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink/20 px-4 py-2 text-xs font-semibold text-ink/70 transition-colors hover:border-coral hover:bg-coral/20 hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover pôster
            </button>
            {enviando && (
              <span className="inline-flex items-center gap-2 text-xs text-ink/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Enviando imagem...
              </span>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(event) => {
            event.preventDefault();
            setArrastando(false);
            enviarArquivo(event.dataTransfer.files?.[0]);
          }}
          disabled={enviando}
          className={`mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
            arrastando
              ? "border-ink bg-mustard/30"
              : "border-ink/30 bg-cream hover:border-ink"
          }`}
        >
          {enviando ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-ink/50" />
              <span className="text-sm text-ink/60">Enviando imagem...</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-ink/50" />
              <span className="text-sm font-medium text-ink">
                Clique para escolher ou arraste a imagem aqui
              </span>
              <span className="text-xs text-ink/45">JPG, PNG ou WEBP · até 5 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          enviarArquivo(file);
        }}
      />

      {erro && <p className="mt-2 text-xs font-medium text-coral">{erro}</p>}
    </div>
  );
}
const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Aceita links youtube.com/watch, youtu.be, /shorts/, /live/, /embed/
 * e devolve { id, erro }. id vazio + erro preenchido = link inválido.
 */
export function parseYoutube(input) {
  const raw = String(input || "").trim();
  if (!raw) return { id: "", erro: "" };

  let candidato = "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const partes = url.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
      candidato = partes[0] || "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname.startsWith("/watch")) candidato = url.searchParams.get("v") || "";
      else if (["embed", "shorts", "live", "v"].includes(partes[0])) candidato = partes[1] || "";
    }
  } catch {
    candidato = "";
  }

  if (!ID_PATTERN.test(candidato)) {
    return {
      id: "",
      erro: "Link inválido. Use youtube.com/watch?v=..., youtu.be/... ou /shorts/....",
    };
  }
  return { id: candidato, erro: "" };
}

export const youtubeId = (link) => parseYoutube(link).id;

export const youtubeEmbedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

export const youtubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

export const youtubeThumbUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
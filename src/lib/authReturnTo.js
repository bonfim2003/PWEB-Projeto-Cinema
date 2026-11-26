export function safeReturnTo(fallback = "/") {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("returnTo");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

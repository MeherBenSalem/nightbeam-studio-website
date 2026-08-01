const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** Return a canonical YouTube video id from an id or supported URL. */
export function normalizeYouTubeVideoId(value: string | null | undefined): string | null {
  const raw = value?.trim() ?? "";
  if (!raw) return null;
  if (VIDEO_ID_PATTERN.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  let candidate: string | null = null;
  if (url.hostname.toLowerCase().endsWith("youtu.be")) {
    candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (url.pathname === "/watch") {
    candidate = url.searchParams.get("v");
  } else {
    const parts = url.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live"].includes(parts[0] ?? "")) candidate = parts[1] ?? null;
  }

  return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

export function selectHomepageVideoId(adminOverride: string | null | undefined, fallbackVideoId: string | null | undefined): string | null {
  return normalizeYouTubeVideoId(adminOverride) ?? normalizeYouTubeVideoId(fallbackVideoId);
}

import "server-only";
import { createCache } from "@/lib/curseforge/cache";
import { getServerEnv } from "@/lib/config/env";

const cache = createCache({ prefix: "yt:" });

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Latest public video from the studio channel. Prefers an explicit env
// override, otherwise resolves the channel page (works from the server
// network) and caches the result for an hour.
export async function getLatestVideoId(): Promise<string | null> {
  const env = getServerEnv();
  if (env.YOUTUBE_VIDEO_ID) return env.YOUTUBE_VIDEO_ID;

  const cached = await cache.get<string>("latest-video");
  if (cached) return cached;
  if ((await cache.get<string>("latest-video-miss")) === "1") return null;

  try {
    const response = await fetch(`https://www.youtube.com/${env.YOUTUBE_CHANNEL_HANDLE}`, {
      headers: { "user-agent": BROWSER_UA, "accept-language": "en" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const html = await response.text();
    const match = html.match(/"videoId":"([A-Za-z0-9_-]{11})"/);
    if (match) {
      await cache.set("latest-video", match[1], 60 * 60);
      return match[1];
    }
  } catch {
    // Negative-cache so blocked networks don't slow every page load.
    await cache.set("latest-video-miss", "1", 30 * 60);
  }
  return null;
}

// Real subscriber count when a Google API key is configured; otherwise the
// configured static value is used.
export async function getYouTubeSubscribers(): Promise<number | null> {
  const env = getServerEnv();
  if (!env.GOOGLE_API_KEY) return null;
  const cached = await cache.get<number>("subscribers");
  if (cached !== null && cached !== undefined) return cached;
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${encodeURIComponent(
      env.YOUTUBE_CHANNEL_HANDLE,
    )}&key=${encodeURIComponent(env.GOOGLE_API_KEY)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { items?: Array<{ statistics?: { subscriberCount?: string } }> };
    const count = Number(data.items?.[0]?.statistics?.subscriberCount);
    if (Number.isFinite(count) && count > 0) {
      await cache.set("subscribers", count, 60 * 60 * 6);
      return count;
    }
  } catch {
    // Fall through.
  }
  return null;
}

import { describe, expect, it } from "vitest";
import { normalizeYouTubeVideoId, selectHomepageVideoId } from "@/lib/utils/youtube";

describe("YouTube video ids", () => {
  it("normalizes supported URL shapes and raw ids", () => {
    expect(normalizeYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(normalizeYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=20s")).toBe("dQw4w9WgXcQ");
    expect(normalizeYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(normalizeYouTubeVideoId("youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects invalid, empty, and non-YouTube values", () => {
    expect(normalizeYouTubeVideoId("")).toBeNull();
    expect(normalizeYouTubeVideoId(null)).toBeNull();
    expect(normalizeYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(normalizeYouTubeVideoId("too-short")).toBeNull();
  });

  it("uses the admin override before the configured/automatic fallback", () => {
    expect(selectHomepageVideoId("https://youtu.be/dQw4w9WgXcQ", "aaaaaaaaaaa")).toBe("dQw4w9WgXcQ");
    expect(selectHomepageVideoId("", "aaaaaaaaaaa")).toBe("aaaaaaaaaaa");
    expect(selectHomepageVideoId(undefined, null)).toBeNull();
  });
});

// Client-safe configuration (only NEXT_PUBLIC_* values are inlined).

export const publicConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "NightBeam Studio",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false",
  // Estimated conversation length (chars/4) that triggers the "start a new
  // conversation" compaction prompt.
  chatbotCompactAtTokens: Number(process.env.NEXT_PUBLIC_CHATBOT_COMPACT_AT_TOKENS ?? 8000),
};

import "server-only";
import { z } from "zod";

const bool = (def: boolean) =>
  z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => (v === undefined ? def : v === "true" || v === "1"));

const signups = z
  .enum(["true", "false", "1", "0"])
  .optional()
  .transform((v) => (v === undefined ? process.env.NODE_ENV !== "production" : v === "true" || v === "1"));

const serverEnvSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("NightBeam Studio"),
  DATA_BACKEND: z.enum(["auto", "prisma", "memory"]).default("auto"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  AUTH_URL: z.string().optional(),
  AUTH_TRUST_HOST: bool(false),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_DISCORD_ID: z.string().optional(),
  AUTH_DISCORD_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_ADMIN_EMAIL: z.string().email().default("admin@nightbeam.studio"),
  AUTH_ADMIN_PASSWORD: z.string().default("NightBeamAdmin123!"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("NightBeam Studio <no-reply@nightbeam.studio>"),
  DEV_AUTO_VERIFY: bool(true),
  SIGNUPS_ENABLED: signups,
  TURNSTILE_SECRET_KEY: z.string().optional(),
  CURSEFORGE_API_KEY: z.string().optional(),
  CURSEFORGE_AUTHOR_ID: z.string().optional(),
  CURSEFORGE_SEARCH_TERM: z.string().optional(),
  CURSEFORGE_GAME_ID: z.coerce.number().default(432),
  YOUTUBE_VIDEO_ID: z.string().optional(),
  YOUTUBE_CHANNEL_HANDLE: z.string().default("@nightbeamstudio"),
  GOOGLE_API_KEY: z.string().optional(),
  CACHE_TTL_PROJECTS: z.coerce.number().default(900),
  CACHE_TTL_DETAILS: z.coerce.number().default(1800),
  CACHE_TTL_STATS: z.coerce.number().default(600),
  CACHE_TTL_FILES: z.coerce.number().default(600),
  SYNC_ENABLED: bool(true),
  CRON_SYNC: z.string().default("*/30 * * * *"),
  CRON_DIGEST: z.string().default("0 9 * * 1"),
  COMMUNITY_DISCORD_URL: z.string().url().default("https://discord.gg/e4hRcaZM8G"),
  COMMUNITY_YOUTUBE_URL: z
    .string()
    .url()
    .default("https://www.youtube.com/@nightbeamstudio"),
  COMMUNITY_GITHUB_URL: z.string().url().default("https://github.com/MeherBenSalem?tab=repositories"),
  COMMUNITY_DISCORD_MEMBERS: z.coerce.number().default(3000),
  COMMUNITY_YOUTUBE_SUBSCRIBERS: z.coerce.number().default(380),
  COMMUNITY_GITHUB_STARS: z.coerce.number().default(0),
  ANALYTICS_ENABLED: bool(true),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      // Fail loudly in production; degrade to defaults elsewhere.
      throw new Error(`Invalid server environment: ${parsed.error.message}`);
    }
    console.warn("[env] Invalid server environment, using defaults:", parsed.error.flatten().fieldErrors);
  }
  cached = parsed.success ? parsed.data : serverEnvSchema.parse({});
  return cached;
}

export function isOAuthConfigured(provider: "google" | "discord" | "github"): boolean {
  const env = getServerEnv();
  const id = provider === "google" ? env.AUTH_GOOGLE_ID : provider === "discord" ? env.AUTH_DISCORD_ID : env.AUTH_GITHUB_ID;
  const secret =
    provider === "google"
      ? env.AUTH_GOOGLE_SECRET
      : provider === "discord"
        ? env.AUTH_DISCORD_SECRET
        : env.AUTH_GITHUB_SECRET;
  return Boolean(id && secret);
}

export function isSmtpConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

export function isTurnstileConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

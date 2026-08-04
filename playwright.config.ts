import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      DATA_BACKEND: "memory",
      AUTH_SECRET: "playwright-test-secret",
      AUTH_URL: `http://localhost:${PORT}`,
      APP_URL: `http://localhost:${PORT}`,
      AUTH_ADMIN_EMAIL: "admin@nightbeam.studio",
      AUTH_ADMIN_PASSWORD: "NightBeamAdmin123!",
      DEV_AUTO_VERIFY: "true",
      SIGNUPS_ENABLED: "true",
      ANALYTICS_ENABLED: "false",
      DEEPSEEK_API_KEY: "e2e-fake-key",
      CHATBOT_KB_ROOTS: "./tests/fixtures/kb",
      // Small compaction threshold so the flow is testable quickly.
      NEXT_PUBLIC_CHATBOT_COMPACT_AT_TOKENS: "100",
    },
  },
});

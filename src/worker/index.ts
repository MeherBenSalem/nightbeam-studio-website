import cron from "node-cron";
import { getServerEnv } from "@/lib/config/env";
import { runCurseForgeSync } from "@/lib/curseforge/sync";
import { runDigestJob } from "@/lib/notifications/digest";

function guard(name: string, task: () => Promise<void>): void {
  task().catch((error) => {
    console.error(`[worker] ${name} failed:`, error instanceof Error ? error.message : error);
  });
}

async function main() {
  const env = getServerEnv();
  console.log(`[worker] starting (sync=${env.SYNC_ENABLED}, digest cron=${env.CRON_DIGEST})`);

  if (env.SYNC_ENABLED) {
    cron.schedule(env.CRON_SYNC, () => guard("curseforge-sync", async () => {
      await runCurseForgeSync();
    }), { timezone: "UTC" });
    guard("curseforge-sync-initial", async () => {
      await runCurseForgeSync();
    });
  } else {
    console.log("[worker] CurseForge sync disabled by SYNC_ENABLED=false");
  }

  cron.schedule(env.CRON_DIGEST, () => guard("digest", async () => {
    const result = await runDigestJob();
    console.log(`[worker] digest sent=${result.sent} skipped=${result.skipped}`);
  }), { timezone: "UTC" });

  console.log("[worker] cron jobs registered");
}

void main();

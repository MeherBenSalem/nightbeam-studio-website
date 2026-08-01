import { runCurseForgeSync } from "../src/lib/curseforge/sync";

runCurseForgeSync()
  .then((state) => {
    console.log(`Sync state: ${state.status} — ${state.message ?? "no message"}`);
    process.exit(state.status === "ERROR" ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

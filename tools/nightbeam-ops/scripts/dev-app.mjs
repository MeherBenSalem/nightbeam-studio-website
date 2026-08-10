import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import waitOn from "wait-on";
import * as esbuild from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const mainCtx = await esbuild.context({
  entryPoints: [path.join(root, "electron/main.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.join(root, "dist-electron/main.js"),
  external: ["electron"],
  packages: "bundle",
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
  },
});

const preloadCtx = await esbuild.context({
  entryPoints: [path.join(root, "electron/preload.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(root, "dist-electron/preload.cjs"),
  external: ["electron"],
});

await Promise.all([mainCtx.watch(), preloadCtx.watch()]);

const vite = spawn("npx", ["vite"], { cwd: root, stdio: "inherit", shell: true });

await waitOn({ resources: ["http://127.0.0.1:5179"], timeout: 60_000 });

const electron = spawn("npx", ["electron", "."], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: "1", ELECTRON_DEV: "1" },
});

function shutdown() {
  vite.kill();
  electron.kill();
  void mainCtx.dispose();
  void preloadCtx.dispose();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

electron.on("exit", shutdown);

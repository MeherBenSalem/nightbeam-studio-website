import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.join(root, "..");

await esbuild.build({
  entryPoints: [path.join(pkg, "electron/main.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.join(pkg, "dist-electron/main.js"),
  external: ["electron"],
  packages: "bundle",
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
  },
});

await esbuild.build({
  entryPoints: [path.join(pkg, "electron/preload.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(pkg, "dist-electron/preload.cjs"),
  external: ["electron"],
});

console.log("electron build ok");

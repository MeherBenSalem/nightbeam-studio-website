import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "src/ui"),
  base: "./",
  server: { port: 5179, strictPort: true },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@store": path.resolve(__dirname, "src/store"),
      "@seed": path.resolve(__dirname, "src/seed"),
    },
  },
});

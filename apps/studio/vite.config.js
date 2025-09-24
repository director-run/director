import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  plugins: [react()],
  root: "src",
  base: basePath,
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  css: {
    postcss: resolve(__dirname, "./postcss.config.mjs"),
  },
});

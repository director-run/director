import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  plugins: [react()],
  root: "src",
  base: basePath,
  resolve: {
    alias: {
      "@director.run/gateway": resolve(__dirname, "../../apps/gateway/src"),
      "@director.run/registry": resolve(__dirname, "../../apps/registry/src"),
      "@director.run/utilities": resolve(
        __dirname,
        "../../packages/utilities/src",
      ),
      "@director.run/design": resolve(__dirname, "../../packages/design/src"),
    },
  },
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

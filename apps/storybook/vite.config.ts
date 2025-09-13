import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./.storybook/postcss.config.mjs",
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

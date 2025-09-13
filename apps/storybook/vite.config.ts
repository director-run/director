import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
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

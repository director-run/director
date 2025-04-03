import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import configPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;

const config: UserConfig = {
  clearScreen: true,
  server: {
    port: 3001,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  plugins: [react(), tailwindcss(), configPaths()],
};

export default defineConfig(config);

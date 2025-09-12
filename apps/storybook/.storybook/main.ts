import { resolve } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@": resolve(__dirname, "../src"),
          "@director.run/gateway/client": resolve(
            __dirname,
            "../src/mocks/gateway-client.ts",
          ),
          "@director.run/gateway/routers/trpc/index": resolve(
            __dirname,
            "../src/mocks/trpc-router.ts",
          ),
        },
      },
      css: {
        postcss: resolve(__dirname, "./postcss.config.mjs"),
      },
      define: {
        global: "globalThis",
        "process.env.NODE_ENV": '"production"',
      },
      optimizeDeps: {
        exclude: [
          "@director.run/gateway",
          "@director.run/mcp",
          "@director.run/registry",
        ],
      },
    });
  },
};

export default config;

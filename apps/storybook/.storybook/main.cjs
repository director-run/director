const { resolve } = require("path");

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
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
    const { mergeConfig } = require("vite");
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

module.exports = config;

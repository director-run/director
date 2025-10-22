const { resolve } = require("path");

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../src/assets"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  viteFinal(config) {
    const { mergeConfig } = require("vite");
    return mergeConfig(config, {
      css: {
        postcss: resolve(__dirname, "./postcss.config.mjs"),
      },
      define: {
        global: "globalThis",
        "process.env.NODE_ENV": '"production"',
      },
      resolve: {
        alias: {
          "@director.run/design": resolve(
            __dirname,
            "../../../packages/design/src",
          ),
          "@director.run/utilities": resolve(
            __dirname,
            "../../../packages/utilities/src",
          ),
        },
      },
    });
  },
};

module.exports = config;

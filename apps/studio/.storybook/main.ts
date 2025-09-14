import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: "../next.config.js",
    },
  },
  staticDirs: ["../public"],
  managerHead: (head) => `
  ${head}
  <style>
    /* Custom styling for red sidebar and Design branding */
    .sidebar-container {
      background-color: #dc2626 !important;
    }
    
  </style>
  
`,
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;

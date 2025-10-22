import type { Preview } from "@storybook/react-vite";
import "../src/fonts.css";
import "../src/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a1a1a",
        },
      ],
    },
  },
  globalTypes: {
    darkMode: {
      defaultValue: false,
      toolbar: {
        title: "Dark mode",
        icon: "contrast",
        items: [
          { value: false, title: "Light mode" },
          { value: true, title: "Dark mode" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;

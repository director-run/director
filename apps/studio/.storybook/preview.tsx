import type { Decorator, Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from "storybook/viewport";
import "../src/fonts.css";
import "../src/globals.css";

const withDarkMode: Decorator = (Story, context) => {
  const raw = context.globals.darkMode;
  const darkMode = raw === true || raw === "true";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    return () => {
      root.classList.remove("dark");
    };
  }, [darkMode]);

  return <Story />;
};

const preview: Preview = {
  decorators: [withDarkMode],
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
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        ...INITIAL_VIEWPORTS,
      },
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

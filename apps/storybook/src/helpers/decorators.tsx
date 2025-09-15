import type { Decorator } from "@storybook/react";

export const withMainLayout: Decorator = (Story) => (
  <div id="main-layout">
    <Story />
  </div>
);

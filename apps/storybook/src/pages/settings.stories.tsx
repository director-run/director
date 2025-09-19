import { SettingsPage } from "@director.run/studio/components/pages/settings.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "pages/settings",
  component: SettingsPage,
  parameters: { layout: "fullscreen" },
  args: {
    settings: {
      theme: "dark",
      language: "en",
      notifications: "enabled",
    },
    onClickLogout: () => {
      console.log("Logout clicked");
    },
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

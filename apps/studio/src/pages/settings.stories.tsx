import { SettingsPage } from "@director.run/design/components/pages/settings.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

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
    apiKey: null,
    newApiKey: null,
    isLoadingApiKey: false,
    isCreatingApiKey: false,
    onCreateApiKey: () => {
      console.log("Create API key clicked");
    },
    onRecycleApiKey: () => {
      console.log("Recycle API key clicked");
    },
    onClearNewApiKey: () => {
      console.log("Clear new API key clicked");
    },
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithApiKey: Story = {
  args: {
    apiKey: {
      id: "key-123",
      keyPrefix: "dk_abc123",
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    },
  },
};

export const WithNewApiKey: Story = {
  args: {
    newApiKey: "dk_abc123def456ghi789jkl012mno345",
  },
};

export const Loading: Story = {
  args: {
    isLoadingApiKey: true,
  },
};

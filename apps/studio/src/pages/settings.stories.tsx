import { SettingsPage } from "@director.run/design/components/pages/settings.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/settings",
  component: SettingsPage,
  parameters: { layout: "fullscreen" },
  args: {
    settings: {
      Email: "user@director.run",
    },
    onClickLogout: () => {
      console.log("Logout clicked");
    },
    apiKey: null,
    newApiKey: null,
    isLoadingApiKey: false,
    isRecyclingApiKey: false,
    onCreateApiKey: () => {
      console.log("Create API key clicked");
    },
    onRecycleApiKey: () => {
      console.log("Recycle API key clicked");
    },
    onClearNewApiKey: () => {
      console.log("Clear new API key clicked");
    },
    onCopyApiKey: (text: string) => {
      console.log("Copy API key:", text);
      navigator.clipboard.writeText(text);
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

export const Loading: Story = {
  args: {
    isLoadingApiKey: true,
  },
};

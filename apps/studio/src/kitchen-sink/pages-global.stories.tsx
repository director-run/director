import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { FullScreenLoader } from "@director.run/design/components/pages/global/loader.tsx";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Global full-screen states used across the app for loading and hard errors.
 * These have no stories in the app today.
 */
const meta = {
  title: "kitchen-sink/pages/global-states",
  component: FullScreenError,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FullScreenError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loader: Story = {
  render: () => <FullScreenLoader />,
  parameters: { chromatic: { disableSnapshot: true } },
};

export const ErrorDeadSmiley: Story = {
  args: {
    icon: "dead-smiley",
    fullScreen: true,
    title: "Unexpected Error",
    subtitle: "Something went wrong. Please try again.",
  },
};

export const ErrorPlugs: Story = {
  args: {
    icon: "plugs",
    fullScreen: true,
    title: "Disconnected",
    subtitle: "We lost connection to the gateway.",
  },
};

export const ErrorWithData: Story = {
  args: {
    icon: "dead-smiley",
    fullScreen: true,
    title: "Request failed",
    subtitle: "The gateway returned an error.",
    data: {
      code: "INTERNAL_SERVER_ERROR",
      path: "store.get",
      message: "Playbook not found",
    },
  },
};

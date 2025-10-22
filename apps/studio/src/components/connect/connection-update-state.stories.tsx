import { ConnectionUpdateState } from "@director.run/design/components/connect/connection-update-state.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/connection-update-state",
  component: ConnectionUpdateState,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConnectionUpdateState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cliVersion: "1.0.0",
    studioVersion: "1.2.0",
  },
};
